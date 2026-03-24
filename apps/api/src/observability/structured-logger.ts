import { LoggerService } from "@nestjs/common";

type LogLevel = "log" | "error" | "warn" | "debug" | "verbose";

type LogRecord = {
  level: LogLevel;
  message: string;
  context?: string;
  requestId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  durationMs?: number;
  error?: string;
  timestamp: string;
};

export class StructuredLogger implements LoggerService {
  constructor(private readonly context = "api") {}

  log(message: unknown, context?: string) {
    this.write("log", message, context);
  }

  error(message: unknown, stack?: string, context?: string) {
    this.write("error", message, context, stack);
  }

  warn(message: unknown, context?: string) {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string) {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write("verbose", message, context);
  }

  requestCompleted(entry: Omit<LogRecord, "level" | "message" | "timestamp">) {
    this.write("log", "request_completed", undefined, undefined, entry);
  }

  private write(
    level: LogLevel,
    message: unknown,
    context?: string,
    stack?: string,
    entry: Partial<LogRecord> = {}
  ) {
    const payload: LogRecord = {
      level,
      message: this.stringifyMessage(message),
      context: context ?? this.context,
      timestamp: new Date().toISOString(),
      ...entry
    };

    if (stack) {
      payload.error = stack;
    }

    const line = JSON.stringify(payload);

    if (level === "error") {
      console.error(line);
      return;
    }

    if (level === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  }

  private stringifyMessage(message: unknown): string {
    if (typeof message === "string") {
      return message;
    }

    if (message instanceof Error) {
      return message.message;
    }

    return JSON.stringify(message);
  }
}
