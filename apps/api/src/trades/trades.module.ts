import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { TradesController } from "./trades.controller";
import { TradesService } from "./trades.service";

@Module({
  controllers: [TradesController, OrdersController],
  providers: [TradesService],
  exports: [TradesService]
})
export class TradesModule {}
