import { Controller, Get, Req, ServiceUnavailableException } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
@ApiTags("system")
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @ApiOkResponse({
    description: "API health check",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        requestId: { type: "string", example: "req_123" }
      },
      required: ["status", "requestId"]
    }
  })
  health(@Req() req: any) {
    return {
      status: "ok",
      requestId: req.requestId ?? req.header("x-request-id") ?? "unknown"
    };
  }

  @Get("readiness")
  @ApiOkResponse({
    description: "API readiness check",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ready" },
        requestId: { type: "string", example: "req_123" }
      },
      required: ["status", "requestId"]
    }
  })
  async readiness(@Req() req: any) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "ready",
        requestId: req.requestId ?? req.header("x-request-id") ?? "unknown"
      };
    } catch {
      throw new ServiceUnavailableException({
        status: "not_ready",
        requestId: req.requestId ?? req.header("x-request-id") ?? "unknown"
      });
    }
  }
}
