import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
