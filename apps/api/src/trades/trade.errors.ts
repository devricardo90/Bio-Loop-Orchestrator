import { ConflictException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";

export interface ApiErrorDetails {
  [key: string]: unknown;
}

export function conflictError(code: string, message: string, details?: ApiErrorDetails): never {
  throw new ConflictException({ code, message, details });
}

export function notFoundError(code: string, message: string, details?: ApiErrorDetails): never {
  throw new NotFoundException({ code, message, details });
}

export function unprocessableError(code: string, message: string, details?: ApiErrorDetails): never {
  throw new UnprocessableEntityException({ code, message, details });
}
