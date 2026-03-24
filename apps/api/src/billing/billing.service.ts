import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { unprocessableError } from "../trades/trade.errors";
import type { BillingExportResult, BillingRangeQuery, BillingSummaryResult } from "./billing.types";
import type { BillingReport, ExportFormat, FeeLineItem, InvoiceDto } from "./billing.types";

const PLATFORM_FEE_RATE = 0.08;
const PICKUP_FEE_SEK = 25;
const DISPUTE_FEE_SEK = 50;
const INVOICE_CURRENCY = "SEK" as const;

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function roundSek(value: number): number {
  return Math.round(value * 100) / 100;
}

function toIsoString(value: Date | string | null | undefined): string {
  if (!value) {
    return new Date(0).toISOString();
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function formatInvoiceDate(value: Date | string | null | undefined): string {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function rangeToName(fromAt: string, toAt: string, format: ExportFormat): string {
  const safeFrom = fromAt.replace(/[:.]/g, "-");
  const safeTo = toAt.replace(/[:.]/g, "-");
  return `billing-${safeFrom}-to-${safeTo}.${format.toLowerCase()}`;
}

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async summarize(range: BillingRangeQuery): Promise<BillingSummaryResult> {
    const invoices = await this.buildInvoices(range);

    return {
      report: this.buildReport(range.fromAt, range.toAt, invoices),
      invoices
    };
  }

  async export(range: BillingRangeQuery, format: ExportFormat): Promise<BillingExportResult> {
    const invoices = await this.buildInvoices(range);
    const exportedInvoices = invoices.map((invoice) => ({
      ...invoice,
      status: "EXPORTED" as const,
      exportedAt: new Date().toISOString()
    }));
    const report = this.buildReport(range.fromAt, range.toAt, exportedInvoices);

    return {
      format,
      downloadName: rangeToName(range.fromAt, range.toAt, format),
      invoiceCount: exportedInvoices.length,
      report,
      invoices: exportedInvoices,
      content: this.buildExportContent(format, exportedInvoices, report)
    };
  }

  private async buildInvoices(range: BillingRangeQuery): Promise<InvoiceDto[]> {
    const fromAt = new Date(range.fromAt);
    const toAt = new Date(range.toAt);

    if (!Number.isFinite(fromAt.getTime()) || !Number.isFinite(toAt.getTime())) {
      unprocessableError("INVALID_BILLING_RANGE", "fromAt and toAt must be valid datetimes");
    }

    if (fromAt.getTime() >= toAt.getTime()) {
      unprocessableError("INVALID_BILLING_RANGE", "fromAt must be before toAt");
    }

    const orders = await this.prisma.order.findMany({
      where: {
        status: "SETTLED"
      },
      include: {
        lot: true,
        dispute: true
      }
    });

    return orders
      .map((order) => this.orderToInvoice(order))
      .filter((invoice) => {
        const issuedAt = new Date(invoice.issuedAt).getTime();
        return issuedAt >= fromAt.getTime() && issuedAt <= toAt.getTime();
      });
  }

  private orderToInvoice(order: {
    id: string;
    lotId: string;
    buyerId: string;
    finalPriceSekPerKg: Prisma.Decimal | number | string;
    pickupStatus: string;
    pickupCompletedAt?: Date | string | null;
    updatedAt?: Date | string | null;
    createdAt?: Date | string | null;
    lot?: {
      storeId: string;
      estimatedWeightKg: Prisma.Decimal | number | string;
      finalWeightKg?: Prisma.Decimal | number | string | null;
    } | null;
    dispute?: {
      status: string;
      reason?: string | null;
    } | null;
  }): InvoiceDto {
    if (!order.lot) {
      unprocessableError("BILLING_LOT_MISSING", "Settled order must include lot data for billing", {
        orderId: order.id
      });
    }

    const billedWeightKg = roundSek(toNumber(order.lot.finalWeightKg ?? order.lot.estimatedWeightKg));
    const unitPriceSekPerKg = roundSek(toNumber(order.finalPriceSekPerKg));
    const subtotalSek = roundSek(billedWeightKg * unitPriceSekPerKg);
    const fees = this.calculateFees(order, subtotalSek);
    const feeTotalSek = roundSek(fees.reduce((acc, fee) => acc + fee.amountSek, 0));
    const totalSek = roundSek(subtotalSek - feeTotalSek);
    const issuedAt = formatInvoiceDate(order.pickupCompletedAt ?? order.updatedAt ?? order.createdAt);

    return {
      id: `inv_${order.id}`,
      orderId: order.id,
      sellerId: order.lot.storeId,
      buyerId: order.buyerId,
      currency: INVOICE_CURRENCY,
      status: "READY",
      billedWeightKg,
      subtotalSek,
      feeTotalSek,
      totalSek,
      issuedAt,
      exportedAt: null,
      lineItems: [
        {
          id: `line_${order.id}_commodity`,
          label: `Lot ${order.lot.storeId}`,
          quantityKg: billedWeightKg,
          unitPriceSekPerKg,
          amountSek: subtotalSek
        }
      ],
      fees
    };
  }

  private calculateFees(
    order: {
      id: string;
      pickupStatus: string;
      dispute?: { status: string; reason?: string | null } | null;
    },
    subtotalSek: number
  ): FeeLineItem[] {
    const fees: FeeLineItem[] = [
      {
        id: `fee_${order.id}_platform`,
        type: "PLATFORM_PERCENT",
        label: "Platform fee (8%)",
        amountSek: roundSek(subtotalSek * PLATFORM_FEE_RATE)
      }
    ];

    if (order.pickupStatus === "COMPLETED") {
      fees.push({
        id: `fee_${order.id}_pickup`,
        type: "PICKUP_FLAT",
        label: "Pickup fee",
        amountSek: PICKUP_FEE_SEK
      });
    }

    if (order.dispute?.status === "RESOLVED") {
      fees.push({
        id: `fee_${order.id}_dispute`,
        type: "DISPUTE_FLAT",
        label: "Dispute handling fee",
        amountSek: DISPUTE_FEE_SEK
      });
    }

    return fees;
  }

  private buildReport(fromAt: string, toAt: string, invoices: InvoiceDto[]): BillingReport {
    return invoices.reduce<BillingReport>(
      (report, invoice) => ({
        fromAt,
        toAt,
        currency: INVOICE_CURRENCY,
        invoiceCount: report.invoiceCount + 1,
        subtotalSek: roundSek(report.subtotalSek + invoice.subtotalSek),
        feeTotalSek: roundSek(report.feeTotalSek + invoice.feeTotalSek),
        totalSek: roundSek(report.totalSek + invoice.totalSek)
      }),
      {
        fromAt,
        toAt,
        currency: INVOICE_CURRENCY,
        invoiceCount: 0,
        subtotalSek: 0,
        feeTotalSek: 0,
        totalSek: 0
      }
    );
  }

  private buildExportContent(format: ExportFormat, invoices: InvoiceDto[], report: BillingReport): string {
    if (format === "CSV") {
      const header = [
        "invoiceId",
        "orderId",
        "sellerId",
        "buyerId",
        "billedWeightKg",
        "subtotalSek",
        "feeTotalSek",
        "totalSek",
        "issuedAt"
      ];
      const rows = invoices.map((invoice) =>
        [
          invoice.id,
          invoice.orderId,
          invoice.sellerId,
          invoice.buyerId,
          invoice.billedWeightKg,
          invoice.subtotalSek,
          invoice.feeTotalSek,
          invoice.totalSek,
          invoice.issuedAt
        ].join(",")
      );

      return [header.join(","), ...rows].join("\n");
    }

    return JSON.stringify({ invoices, report }, null, 2);
  }
}
