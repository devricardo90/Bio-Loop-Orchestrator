import { randomUUID } from "node:crypto";
import { StructuredLogger } from "./structured-logger";

type RequestWithId = any;

export function createRequestIdMiddleware(logger: StructuredLogger) {
  return (req: RequestWithId, res: any, next: any) => {
    const incoming = req.header("x-request-id")?.trim();
    const requestId = incoming || randomUUID();
    const startedAt = Date.now();

    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    res.on("finish", () => {
      logger.requestCompleted({
        requestId,
        method: req.method,
        url: req.originalUrl ?? req.url,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });

    next();
  };
}
