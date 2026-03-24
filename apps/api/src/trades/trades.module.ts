import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { OrdersController } from "./orders.controller";
import { TradesController } from "./trades.controller";
import { TradesService } from "./trades.service";

@Module({
  imports: [PrismaModule],
  controllers: [TradesController, OrdersController],
  providers: [TradesService],
  exports: [TradesService]
})
export class TradesModule {}
