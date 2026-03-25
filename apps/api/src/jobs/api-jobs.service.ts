import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import type { Auction, Order } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TradesService } from "../trades/trades.service";
import type { ApiJobsConfig, JobSweepResult, WorkerStatusSnapshot } from "./api-jobs.types";

const DEFAULT_SWEEP_INTERVAL_MS = 60_000;
const DEFAULT_INITIAL_DELAY_MS = 5_000;
const DEFAULT_MAX_ATTEMPTS = 2;
const DEFAULT_MAX_FAILURE_STREAK = 3;
const DEFAULT_STALE_AFTER_MS = 3 * DEFAULT_SWEEP_INTERVAL_MS;
const JOB_LOCK_KEY = 4_021_500_1;

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

@Injectable()
export class ApiJobsService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  private lockHeld = false;
  private lastStartedAt: Date | null = null;
  private lastFinishedAt: Date | null = null;
  private lastSuccessAt: Date | null = null;
  private lastErrorAt: Date | null = null;
  private lastErrorMessage: string | null = null;
  private failureStreak = 0;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tradesService: TradesService
  ) {}

  getConfig(): ApiJobsConfig {
    return {
      sweepIntervalMs: toNumber(process.env["JOB_SWEEP_INTERVAL_MS"], DEFAULT_SWEEP_INTERVAL_MS),
      initialDelayMs: toNumber(process.env["JOB_INITIAL_DELAY_MS"], DEFAULT_INITIAL_DELAY_MS),
      maxAttempts: toNumber(process.env["JOB_MAX_ATTEMPTS"], DEFAULT_MAX_ATTEMPTS),
      maxFailureStreak: toNumber(process.env["JOB_MAX_FAILURE_STREAK"], DEFAULT_MAX_FAILURE_STREAK),
      staleAfterMs: toNumber(process.env["JOB_STALE_AFTER_MS"], DEFAULT_STALE_AFTER_MS)
    };
  }

  async onModuleInit() {
    const config = this.getConfig();
    this.timer = setTimeout(() => {
      void this.runSweep();
      this.timer = setInterval(() => {
        void this.runSweep();
      }, config.sweepIntervalMs);
    }, config.initialDelayMs);
  }

  async onModuleDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runSweep(now = new Date()): Promise<{ endAuction: JobSweepResult; noShow: JobSweepResult }> {
    if (this.running) {
      return {
        endAuction: this.createSkippedSweepResult(),
        noShow: this.createSkippedSweepResult()
      };
    }

    const lockAcquired = await this.tryAcquireLock();
    if (!lockAcquired) {
      return {
        endAuction: this.createSkippedSweepResult(),
        noShow: this.createSkippedSweepResult()
      };
    }

    this.running = true;
    this.lastStartedAt = now;

    try {
      const result = {
        endAuction: await this.runEndAuctionSweep(now),
        noShow: await this.runNoShowSweep(now)
      };

      const failedCount = result.endAuction.failed + result.noShow.failed;
      this.failureStreak = failedCount > 0 ? this.failureStreak + 1 : 0;
      this.lastSuccessAt = new Date();
      if (failedCount > 0) {
        this.lastErrorAt = new Date();
        this.lastErrorMessage = `job sweep partial failure: ${failedCount}`;
      } else {
        this.lastErrorAt = null;
        this.lastErrorMessage = null;
      }
      return result;
    } catch (error) {
      this.failureStreak += 1;
      this.lastErrorAt = new Date();
      this.lastErrorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.running = false;
      this.lastFinishedAt = new Date();
      await this.releaseLock();
    }
  }

  async runEndAuctionSweep(now = new Date()): Promise<JobSweepResult> {
    const auctions = await this.prisma.auction.findMany({
      where: {
        status: "LIVE",
        endAt: { lte: now }
      }
    });

    let processed = 0;
    let failed = 0;
    let retried = 0;
    for (const auction of auctions) {
      const outcome = await this.runWithRetries(() => this.tradesService.endAuction(auction.id), `end_auction:${auction.id}`);
      processed += outcome.processed;
      failed += outcome.failed;
      retried += outcome.retried;
    }

    return {
      scanned: auctions.length,
      processed,
      failed,
      retried,
      skipped: 0
    };
  }

  async runNoShowSweep(now = new Date()): Promise<JobSweepResult> {
    const orders = await this.prisma.order.findMany({
      where: {
        pickupStatus: "SCHEDULED",
        pickupWindowEndAt: { lte: now }
      }
    });

    let processed = 0;
    let failed = 0;
    let retried = 0;
    for (const order of orders) {
      const outcome = await this.runWithRetries(() => this.tradesService.markNoShow(order.id), `no_show:${order.id}`);
      processed += outcome.processed;
      failed += outcome.failed;
      retried += outcome.retried;
    }

    return {
      scanned: orders.length,
      processed,
      failed,
      retried,
      skipped: 0
    };
  }

  getWorkerStatus(now = new Date()): WorkerStatusSnapshot {
    const config = this.getConfig();
    const lastActivity = this.lastSuccessAt ?? this.lastFinishedAt ?? this.lastStartedAt;
    const stale =
      !this.running &&
      lastActivity !== null &&
      now.getTime() - lastActivity.getTime() > config.staleAfterMs;
    const degraded = this.failureStreak >= config.maxFailureStreak || stale;

    return {
      status: this.running ? "running" : degraded ? "degraded" : this.lastSuccessAt ? "healthy" : "idle",
      lastStartedAt: this.lastStartedAt?.toISOString() ?? null,
      lastFinishedAt: this.lastFinishedAt?.toISOString() ?? null,
      lastSuccessAt: this.lastSuccessAt?.toISOString() ?? null,
      lastErrorAt: this.lastErrorAt?.toISOString() ?? null,
      lastErrorMessage: stale && !this.lastErrorMessage ? "job worker stale" : this.lastErrorMessage,
      failureStreak: this.failureStreak,
      lockHeld: this.lockHeld
    };
  }

  private createSkippedSweepResult(): JobSweepResult {
    return {
      scanned: 0,
      processed: 0,
      failed: 0,
      retried: 0,
      skipped: 1
    };
  }

  private async runWithRetries(operation: () => Promise<unknown>, label: string) {
    const maxAttempts = this.getConfig().maxAttempts;
    let retried = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await operation();
        return {
          processed: 1,
          failed: 0,
          retried
        };
      } catch (error) {
        if (attempt >= maxAttempts) {
          this.lastErrorMessage = `${label}: ${error instanceof Error ? error.message : String(error)}`;
          return {
            processed: 0,
            failed: 1,
            retried
          };
        }

        retried += 1;
      }
    }

    return {
      processed: 0,
      failed: 1,
      retried
    };
  }

  private async tryAcquireLock() {
    if (typeof (this.prisma as any).$queryRawUnsafe !== "function") {
      this.lockHeld = true;
      return true;
    }

    const result = (await this.prisma.$queryRawUnsafe(`SELECT pg_try_advisory_lock(${JOB_LOCK_KEY}) AS locked`)) as Array<{
      locked?: boolean;
    }>;
    const locked = result[0]?.locked === true;
    this.lockHeld = locked;
    return locked;
  }

  private async releaseLock() {
    if (!this.lockHeld) {
      return;
    }

    if (typeof (this.prisma as any).$queryRawUnsafe !== "function") {
      this.lockHeld = false;
      return;
    }

    try {
      await this.prisma.$queryRawUnsafe(`SELECT pg_advisory_unlock(${JOB_LOCK_KEY})`);
    } finally {
      this.lockHeld = false;
    }
  }
}
