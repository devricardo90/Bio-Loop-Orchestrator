import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

type ExceptionBody = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  statusCode?: unknown;
};

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const rawBody = exception instanceof HttpException ? exception.getResponse() : null;
    const body = this.normalizeBody(rawBody, statusCode, exception);

    response.status(statusCode).json({
      statusCode,
      code: body.code,
      message: body.message,
      details: body.details ?? null,
      requestId: request?.requestId ?? request?.header?.("x-request-id") ?? "unknown"
    });
  }

  private normalizeBody(rawBody: unknown, statusCode: number, exception: unknown) {
    if (rawBody && typeof rawBody === "object" && !Array.isArray(rawBody)) {
      const typed = rawBody as ExceptionBody;
      return {
        code: typeof typed.code === "string" ? typed.code : this.defaultCode(statusCode),
        message: this.extractMessage(typed.message, statusCode, exception),
        details: typed.details
      };
    }

    if (typeof rawBody === "string") {
      return {
        code: this.defaultCode(statusCode),
        message: rawBody,
        details: null
      };
    }

    return {
      code: this.defaultCode(statusCode),
      message: exception instanceof Error ? exception.message : "Internal server error",
      details: null
    };
  }

  private extractMessage(message: unknown, statusCode: number, exception: unknown) {
    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message) && message.every((entry) => typeof entry === "string")) {
      return message.join("; ");
    }

    if (exception instanceof Error && exception.message) {
      return exception.message;
    }

    return this.defaultMessage(statusCode);
  }

  private defaultCode(statusCode: number) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return "UNPROCESSABLE_ENTITY";
      case HttpStatus.SERVICE_UNAVAILABLE:
        return "SERVICE_UNAVAILABLE";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }

  private defaultMessage(statusCode: number) {
    if (statusCode === HttpStatus.SERVICE_UNAVAILABLE) {
      return "Service unavailable";
    }

    if (statusCode >= 500) {
      return "Internal server error";
    }

    return "Request failed";
  }
}
