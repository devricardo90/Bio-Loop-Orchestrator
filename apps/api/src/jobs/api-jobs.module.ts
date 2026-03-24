import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { TradesModule } from "../trades/trades.module";
import { ApiJobsService } from "./api-jobs.service";

@Module({
  imports: [PrismaModule, TradesModule],
  providers: [ApiJobsService],
  exports: [ApiJobsService]
})
export class ApiJobsModule {}
