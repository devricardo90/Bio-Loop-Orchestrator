import { BadRequestException, Body, Controller, Param, Post, Req } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { BUYER_ROLES, Roles } from "../auth/roles.decorator";
import { getMutationContextFromRequest } from "../mutations/mutation-context";
import { normalizeRecordPickupInput, normalizeSchedulePickupInput } from "./trades.validators";
import { TradesService } from "./trades.service";

@Controller("buyer/orders")
@ApiTags("pickup")
@Roles(...BUYER_ROLES)
export class OrdersController {
  constructor(private readonly tradesService: TradesService) {}

  @Post(":orderId/schedule-pickup")
  @ApiOperation({ summary: "Schedule pickup for a buyer order" })
  @ApiParam({ name: "orderId", type: "string" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        pickupWindow: {
          type: "object",
          properties: {
            startAt: { type: "string", format: "date-time" },
            endAt: { type: "string", format: "date-time" }
          },
          required: ["startAt", "endAt"]
        }
      },
      required: ["pickupWindow"]
    }
  })
  @ApiOkResponse({
    description: "Pickup scheduled",
    schema: {
      type: "object",
      properties: {
        order: {
          type: "object",
          properties: {
            id: { type: "string" },
            lotId: { type: "string" },
            buyerId: { type: "string" },
            finalPriceSekPerKg: { type: "number" },
            status: { type: "string" },
            pickupStatus: { type: "string" }
          },
          required: ["id", "lotId", "buyerId", "finalPriceSekPerKg", "status", "pickupStatus"]
        }
      },
      required: ["order"]
    }
  })
  @ApiBadRequestResponse({
    description: "Request validation error",
    schema: { type: "object" }
  })
  async schedulePickup(@Param("orderId") orderId: string, @Body() body: unknown, @Req() req: any) {
    const parsed = normalizeSchedulePickupInput(body);

    if (parsed.orderId && parsed.orderId !== orderId) {
      throw new BadRequestException({
        code: "ORDER_ID_MISMATCH",
        message: "Order id in path and body must match",
        details: {
          orderId,
          bodyOrderId: parsed.orderId
        }
      });
    }

    return this.tradesService.schedulePickup(
      {
        orderId,
        pickupWindow: parsed.pickupWindow
      },
      getMutationContextFromRequest(req)
    );
  }

  @Post(":orderId/pod")
  @ApiOperation({ summary: "Upload POD metadata for a buyer order" })
  @ApiParam({ name: "orderId", type: "string" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        type: { type: "string" },
        url: { type: "string", format: "uri" }
      },
      required: ["type", "url"]
    }
  })
  @ApiOkResponse({
    description: "POD recorded",
    schema: {
      type: "object",
      properties: {
        proof: {
          type: "object",
          properties: {
            id: { type: "string" },
            orderId: { type: "string" },
            type: { type: "string" },
            url: { type: "string" },
            createdAt: { type: "string", format: "date-time" }
          },
          required: ["id", "orderId", "type", "url", "createdAt"]
        }
      },
      required: ["proof"]
    }
  })
  @ApiBadRequestResponse({
    description: "Request validation error",
    schema: { type: "object" }
  })
  async recordPod(@Param("orderId") orderId: string, @Body() body: unknown, @Req() req: any) {
    const parsed = normalizeRecordPickupInput(body);

    if (parsed.orderId && parsed.orderId !== orderId) {
      throw new BadRequestException({
        code: "ORDER_ID_MISMATCH",
        message: "Order id in path and body must match",
        details: {
          orderId,
          bodyOrderId: parsed.orderId
        }
      });
    }

    return this.tradesService.recordPickupProof(
      {
        orderId,
        type: parsed.type,
        url: parsed.url
      },
      getMutationContextFromRequest(req)
    );
  }
}
