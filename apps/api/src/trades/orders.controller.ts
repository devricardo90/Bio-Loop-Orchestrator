import { BadRequestException, Body, Controller, Param, Post } from "@nestjs/common";
import { normalizeRecordPickupInput, normalizeSchedulePickupInput } from "./trades.validators";
import { TradesService } from "./trades.service";

@Controller("buyer/orders")
export class OrdersController {
  constructor(private readonly tradesService: TradesService) {}

  @Post(":orderId/schedule-pickup")
  async schedulePickup(@Param("orderId") orderId: string, @Body() body: unknown) {
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

    return this.tradesService.schedulePickup({
      orderId,
      pickupWindow: parsed.pickupWindow
    });
  }

  @Post(":orderId/pod")
  async recordPod(@Param("orderId") orderId: string, @Body() body: unknown) {
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

    return this.tradesService.recordPickupProof({
      orderId,
      type: parsed.type,
      url: parsed.url
    });
  }
}
