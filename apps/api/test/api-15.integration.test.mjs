import assert from "node:assert/strict";
import { ServiceUnavailableException } from "@nestjs/common";
import { AppController } from "../dist/app.controller.js";
import { ApiJobsService } from "../dist/jobs/api-jobs.service.js";

function createFakePrisma(lockResponses = [true], options = { withAuction: false, withOrder: false }) {
  const state = {
    lockResponses: [...lockResponses],
    queries: []
  };

  return {
    __state: state,
    $queryRaw: async () => [{ "?column?": 1 }],
    $queryRawUnsafe: async (sql) => {
      state.queries.push(sql);
      if (sql.includes("pg_try_advisory_lock")) {
        return [{ locked: state.lockResponses.shift() ?? true }];
      }

      return [{ unlocked: true }];
    },
    auction: {
      findMany: async () => (options.withAuction ? [{ id: "auction-1" }] : [])
    },
    order: {
      findMany: async () => (options.withOrder ? [{ id: "order-1" }] : [])
    }
  };
}

async function main() {
  const prisma = createFakePrisma([false, true]);
  const tradesService = {
    endAuction: async () => undefined,
    markNoShow: async () => undefined
  };
  const jobs = new ApiJobsService(prisma, tradesService);

  const skipped = await jobs.runSweep(new Date("2026-03-24T11:00:00.000Z"));
  assert.equal(skipped.endAuction.skipped, 1);
  assert.equal(skipped.noShow.skipped, 1);

  const processed = await jobs.runSweep(new Date("2026-03-24T11:01:00.000Z"));
  assert.equal(processed.endAuction.processed, 0);
  assert.equal(processed.endAuction.failed, 0);
  assert.equal(jobs.getWorkerStatus(new Date("2026-03-24T11:01:01.000Z")).status, "healthy");

  const degradedJobs = new ApiJobsService(createFakePrisma([true, true, true], { withAuction: true, withOrder: false }), {
    endAuction: async () => {
      throw new Error("auction failed");
    },
    markNoShow: async () => undefined
  });

  await degradedJobs.runSweep().catch(() => undefined);
  await degradedJobs.runSweep().catch(() => undefined);
  await degradedJobs.runSweep().catch(() => undefined);

  const degradedWorker = degradedJobs.getWorkerStatus();
  assert.equal(degradedWorker.status, "degraded");
  assert.equal(degradedWorker.failureStreak >= 3, true);

  const appController = new AppController(
    {
      $queryRaw: async () => [{ "?column?": 1 }]
    },
    degradedJobs
  );

  const health = appController.health({
    requestId: "req-health",
    header: () => undefined
  });
  assert.equal(health.worker.status, "degraded");

  await assert.rejects(
    () =>
      appController.readiness({
        requestId: "req-ready",
        header: () => undefined
      }),
    (error) => {
      assert.ok(error instanceof ServiceUnavailableException);
      const response = error.getResponse();
      assert.equal(response.status, "not_ready");
      assert.equal(response.database.status, "ready");
      assert.equal(response.worker.status, "degraded");
      return true;
    }
  );
}

await main();
