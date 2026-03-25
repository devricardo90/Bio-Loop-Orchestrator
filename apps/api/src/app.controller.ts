import { Controller, Get, Req, ServiceUnavailableException } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiJobsService } from "./jobs/api-jobs.service";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
@ApiTags("system")
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apiJobsService: ApiJobsService
  ) {}

  @Get("health")
  @ApiOkResponse({
    description: "API health check",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        requestId: { type: "string", example: "req_123" },
        worker: { type: "object" }
      },
      required: ["status", "requestId", "worker"]
    }
  })
  health(@Req() req: any) {
    return {
      status: "ok",
      requestId: req.requestId ?? req.header("x-request-id") ?? "unknown",
      worker: this.apiJobsService.getWorkerStatus()
    };
  }

  @Get("readiness")
  @ApiOkResponse({
    description: "API readiness check",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ready" },
        requestId: { type: "string", example: "req_123" },
        database: { type: "object" },
        worker: { type: "object" }
      },
      required: ["status", "requestId", "database", "worker"]
    }
  })
  async readiness(@Req() req: any) {
    const requestId = req.requestId ?? req.header("x-request-id") ?? "unknown";

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: "not_ready",
        requestId,
        database: { status: "not_ready" },
        worker: this.apiJobsService.getWorkerStatus()
      });
    }

    const worker = this.apiJobsService.getWorkerStatus();
    if (worker.status === "degraded") {
      throw new ServiceUnavailableException({
        status: "not_ready",
        requestId,
        database: { status: "ready" },
        worker
      });
    }

    return {
      status: "ready",
      requestId,
      database: { status: "ready" },
      worker
    };
  }
}
