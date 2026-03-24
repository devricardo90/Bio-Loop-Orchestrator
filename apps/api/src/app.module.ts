import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { TradesModule } from "./trades/trades.module";

@Module({
  imports: [PrismaModule, AuthModule, TradesModule],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
