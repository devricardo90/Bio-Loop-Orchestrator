import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags("system")
export class AppController {
  @Get("health")
  @ApiOkResponse({
    description: "API health check",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" }
      },
      required: ["status"]
    }
  })
  health() {
    return {
      status: "ok"
    };
  }
}
