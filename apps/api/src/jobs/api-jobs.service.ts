import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import type { Auction, Order } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TradesService } from "../trades/trades.service";
import type { ApiJobsConfig, JobSweepResult } from "./api-jobs.types";

const DEFAULT_SWEEP_INTERVAL_MS = 60_000;
const DEFAULT_INITIAL_DELAY_MS = 5_000;

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly tradesService: TradesService
  ) {}

  getConfig(): ApiJobsConfig {
    return {
      sweepIntervalMs: toNumber(process.env["JOB_SWEEP_INTERVAL_MS"], DEFAULT_SWEEP_INTERVAL_MS),
      initialDelayMs: toNumber(process.env["JOB_INITIAL_DELAY_MS"], DEFAULT_INITIAL_DELAY_MS)
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
    return {
      endAuction: await this.runEndAuctionSweep(now),
      noShow: await this.runNoShowSweep(now)
    };
  }

  async runEndAuctionSweep(now = new Date()): Promise<JobSweepResult> {
    const auctions = await this.prisma.auction.findMany({
      where: {
        status: "LIVE",
        endAt: { lte: now }
      }
    });

    let processed = 0;
    for (const auction of auctions) {
      await this.tradesService.endAuction(auction.id);
      processed += 1;
    }

    return {
      scanned: auctions.length,
      processed
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
    for (const order of orders) {
      await this.tradesService.markNoShow(order.id);
      processed += 1;
    }

    return {
      scanned: orders.length,
      processed
    };
  }
}
