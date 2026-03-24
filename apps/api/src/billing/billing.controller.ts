import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { Roles, SELLER_ROLES } from "../auth/roles.decorator";
import { unprocessableError } from "../trades/trade.errors";
import type { BillingExportQuery, BillingRangeQuery } from "./billing.types";
import { BillingService } from "./billing.service";

function normalizeBillingRange(query: BillingRangeQuery): BillingRangeQuery {
  const fromAt = typeof query.fromAt === "string" ? query.fromAt.trim() : "";
  const toAt = typeof query.toAt === "string" ? query.toAt.trim() : "";

  if (!fromAt || !toAt) {
    unprocessableError("INVALID_BILLING_RANGE", "fromAt and toAt are required");
  }

  return { fromAt, toAt };
}

function normalizeExportFormat(value: unknown) {
  const candidate = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (candidate !== "CSV" && candidate !== "JSON") {
    unprocessableError("INVALID_EXPORT_FORMAT", "format must be CSV or JSON");
  }

  return candidate;
}

@Controller("seller/reports")
@ApiTags("billing")
@Roles(...SELLER_ROLES)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get billing summary for settled orders in a date range" })
  @ApiQuery({ name: "fromAt", required: true, type: String })
  @ApiQuery({ name: "toAt", required: true, type: String })
  @ApiOkResponse({
    description: "Billing summary",
    schema: {
      type: "object",
      properties: {
        fromAt: { type: "string", format: "date-time" },
        toAt: { type: "string", format: "date-time" },
        currency: { type: "string", example: "SEK" },
        invoiceCount: { type: "integer" },
        subtotalSek: { type: "number" },
        feeTotalSek: { type: "number" },
        totalSek: { type: "number" }
      },
      required: ["fromAt", "toAt", "currency", "invoiceCount", "subtotalSek", "feeTotalSek", "totalSek"]
    }
  })
  @ApiBadRequestResponse({ description: "Validation error", schema: { type: "object" } })
  async summary(@Query() query: BillingRangeQuery) {
    const range = normalizeBillingRange(query);
    const result = await this.billingService.summarize(range);
    return result.report;
  }

  @Get("export")
  @ApiOperation({ summary: "Export invoices for settled orders in CSV or JSON" })
  @ApiQuery({ name: "fromAt", required: true, type: String })
  @ApiQuery({ name: "toAt", required: true, type: String })
  @ApiQuery({ name: "format", required: true, enum: ["CSV", "JSON"] })
  @ApiOkResponse({
    description: "Billing export snapshot",
    schema: {
      type: "object",
      properties: {
        format: { type: "string", enum: ["CSV", "JSON"] },
        downloadName: { type: "string" },
        invoiceCount: { type: "integer" },
        report: { type: "object" },
        invoices: { type: "array", items: { type: "object" } },
        content: { type: "string" }
      },
      required: ["format", "downloadName", "invoiceCount", "report", "invoices", "content"]
    }
  })
  @ApiBadRequestResponse({ description: "Validation error", schema: { type: "object" } })
  async export(@Query() query: BillingExportQuery) {
    const range = normalizeBillingRange(query);
    const format = normalizeExportFormat(query.format);
    return this.billingService.export(range, format);
  }
}
