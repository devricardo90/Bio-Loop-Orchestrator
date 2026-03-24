import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { ApiJobsModule } from "./jobs/api-jobs.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TradesModule } from "./trades/trades.module";

@Module({
  imports: [PrismaModule, AuthModule, TradesModule, ApiJobsModule],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
