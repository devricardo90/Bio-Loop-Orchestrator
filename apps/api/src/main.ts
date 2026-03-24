import "reflect-metadata";
import { randomBytes } from "node:crypto";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DEFAULT_ALLOWED_ORIGINS } from "./auth/auth.constants";
import { parseBooleanEnv, parseOrigins } from "./auth/auth.utils";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  if (parseBooleanEnv(process.env["TRUST_PROXY"], false)) {
    (app as any).set("trust proxy", 1);
  }

  const allowedOrigins = parseOrigins(process.env["ALLOWED_ORIGINS"], DEFAULT_ALLOWED_ORIGINS);
  const appUrl = process.env["APP_URL"]?.trim();
  if (appUrl && !allowedOrigins.includes(appUrl)) {
    allowedOrigins.push(appUrl);
  }

  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        return cb(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error("CORS blocked"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"]
  });

  app.use((req: any, res: any, next: () => void) => {
    res.setHeader("X-Request-Id", req.headers?.["x-request-id"] ?? randomBytes(8).toString("hex"));
    next();
  });

  const port = Number(process.env["PORT"] ?? 4000);
  await app.listen(port);
}

void bootstrap();
