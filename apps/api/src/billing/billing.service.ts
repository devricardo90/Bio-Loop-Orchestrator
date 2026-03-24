import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { unprocessableError } from "../trades/trade.errors";
import type { BillingExportResult, BillingRangeQuery, BillingSummaryResult } from "./billing.types";
import type { BillingReport, ExportFormat, FeeLineItem, InvoiceDto, InvoiceLineItem } from "./billing.types";

const PLATFORM_FEE_RATE = 0.08;
const PICKUP_FEE_SEK = 25;
const DISPUTE_FEE_SEK = 50;
const INVOICE_CURRENCY = "SEK" as const;

type BillingOrderRecord = {
  id: string;
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
};

type PersistedInvoiceRecord = {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  currency: string;
  status: string;
  billedWeightKg: Prisma.Decimal | number | string;
  subtotalSek: Prisma.Decimal | number | string;
  feeTotalSek: Prisma.Decimal | number | string;
  totalSek: Prisma.Decimal | number | string;
  issuedAt: Date | string;
  exportedAt: Date | string | null;
  lineItems: Prisma.JsonValue;
  fees: Array<{
    id: string;
    type: string;
    label: string;
    amountSek: Prisma.Decimal | number | string;
  }>;
};

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

function formatInvoiceDate(value: Date | string | null | undefined): Date {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function rangeToName(fromAt: string, toAt: string, format: ExportFormat): string {
  const safeFrom = fromAt.replace(/[:.]/g, "-");
  const safeTo = toAt.replace(/[:.]/g, "-");
  return `billing-${safeFrom}-to-${safeTo}.${format.toLowerCase()}`;
}

function parseLineItems(value: Prisma.JsonValue): InvoiceLineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const record = entry as Record<string, unknown>;
    return [
      {
        id: typeof record["id"] === "string" ? record["id"] : "line_unknown",
        label: typeof record["label"] === "string" ? record["label"] : "Unknown line",
        quantityKg: Number(record["quantityKg"] ?? 0),
        unitPriceSekPerKg: Number(record["unitPriceSekPerKg"] ?? 0),
        amountSek: Number(record["amountSek"] ?? 0)
      }
    ];
  });
}

function toJsonLineItems(lineItems: InvoiceLineItem[]): Prisma.InputJsonValue {
  return lineItems.map((lineItem) => ({
    id: lineItem.id,
    label: lineItem.label,
    quantityKg: lineItem.quantityKg,
    unitPriceSekPerKg: lineItem.unitPriceSekPerKg,
    amountSek: lineItem.amountSek
  })) as Prisma.InputJsonValue;
}

function toJsonReport(report: BillingReport): Prisma.InputJsonValue {
  return {
    fromAt: report.fromAt,
    toAt: report.toAt,
    currency: report.currency,
    invoiceCount: report.invoiceCount,
    subtotalSek: report.subtotalSek,
    feeTotalSek: report.feeTotalSek,
    totalSek: report.totalSek
  } satisfies Prisma.InputJsonObject;
}

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async summarize(range: BillingRangeQuery): Promise<BillingSummaryResult> {
    const { fromAt, toAt } = this.parseRange(range);
    const invoices = await this.ensureInvoicesAndLoad(fromAt, toAt);

    return {
      report: this.buildReport(fromAt.toISOString(), toAt.toISOString(), invoices),
      invoices
    };
  }

  async export(range: BillingRangeQuery, format: ExportFormat): Promise<BillingExportResult> {
    const { fromAt, toAt } = this.parseRange(range);
    const invoices = await this.ensureInvoicesAndLoad(fromAt, toAt);
    const exportedAt = new Date();

    const exportedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        const updated = await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: "EXPORTED",
            exportedAt
          },
          include: {
            fees: true
          }
        });

        return this.persistedInvoiceToDto(updated);
      })
    );

    const report = this.buildReport(fromAt.toISOString(), toAt.toISOString(), exportedInvoices);
    const content = this.buildExportContent(format, exportedInvoices, report);

    await this.prisma.billingExport.create({
      data: {
        format,
        downloadName: rangeToName(fromAt.toISOString(), toAt.toISOString(), format),
        fromAt,
        toAt,
        invoiceCount: exportedInvoices.length,
        content,
        reportSnapshot: toJsonReport(report)
      }
    });

    return {
      format,
      downloadName: rangeToName(fromAt.toISOString(), toAt.toISOString(), format),
      invoiceCount: exportedInvoices.length,
      report,
      invoices: exportedInvoices,
      content
    };
  }

  private parseRange(range: BillingRangeQuery) {
    const fromAt = new Date(range.fromAt);
    const toAt = new Date(range.toAt);

    if (!Number.isFinite(fromAt.getTime()) || !Number.isFinite(toAt.getTime())) {
      unprocessableError("INVALID_BILLING_RANGE", "fromAt and toAt must be valid datetimes");
    }

    if (fromAt.getTime() >= toAt.getTime()) {
      unprocessableError("INVALID_BILLING_RANGE", "fromAt must be before toAt");
    }

    return { fromAt, toAt };
  }

  private async ensureInvoicesAndLoad(fromAt: Date, toAt: Date): Promise<InvoiceDto[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        status: "SETTLED"
      },
      include: {
        lot: true,
        dispute: true,
        invoice: {
          include: {
            fees: true
          }
        }
      }
    });

    for (const order of orders) {
      await this.upsertInvoiceForOrder(order);
    }

    const invoices = await this.prisma.invoice.findMany({
      where: {
        issuedAt: {
          gte: fromAt,
          lte: toAt
        }
      },
      include: {
        fees: true
      },
      orderBy: {
        issuedAt: "desc"
      }
    });

    return invoices.map((invoice) => this.persistedInvoiceToDto(invoice));
  }

  private async upsertInvoiceForOrder(order: BillingOrderRecord & { invoice?: PersistedInvoiceRecord | null }) {
    if (!order.lot) {
      unprocessableError("BILLING_LOT_MISSING", "Settled order must include lot data for billing", {
        orderId: order.id
      });
    }

    const billedWeightKg = roundSek(toNumber(order.lot.finalWeightKg ?? order.lot.estimatedWeightKg));
    const unitPriceSekPerKg = roundSek(toNumber(order.finalPriceSekPerKg));
    const subtotalSek = roundSek(billedWeightKg * unitPriceSekPerKg);
    const lineItems: InvoiceLineItem[] = [
      {
        id: `line_${order.id}_commodity`,
        label: `Lot ${order.lot.storeId}`,
        quantityKg: billedWeightKg,
        unitPriceSekPerKg,
        amountSek: subtotalSek
      }
    ];
    const fees = this.calculateFees(order, subtotalSek);
    const feeTotalSek = roundSek(fees.reduce((acc, fee) => acc + fee.amountSek, 0));
    const totalSek = roundSek(subtotalSek - feeTotalSek);
    const issuedAt = formatInvoiceDate(order.pickupCompletedAt ?? order.updatedAt ?? order.createdAt);

    const invoice = await this.prisma.invoice.upsert({
      where: { orderId: order.id },
      create: {
        id: `inv_${order.id}`,
        orderId: order.id,
        sellerId: order.lot.storeId,
        buyerId: order.buyerId,
        currency: INVOICE_CURRENCY,
        status: "READY",
        billedWeightKg: new Prisma.Decimal(billedWeightKg),
        subtotalSek: new Prisma.Decimal(subtotalSek),
        feeTotalSek: new Prisma.Decimal(feeTotalSek),
        totalSek: new Prisma.Decimal(totalSek),
        issuedAt,
        exportedAt: null,
        lineItems: toJsonLineItems(lineItems)
      },
      update: {
        sellerId: order.lot.storeId,
        buyerId: order.buyerId,
        currency: INVOICE_CURRENCY,
        status: order.invoice?.status === "SETTLED" ? "SETTLED" : order.invoice?.status === "CANCELLED" ? "CANCELLED" : "READY",
        billedWeightKg: new Prisma.Decimal(billedWeightKg),
        subtotalSek: new Prisma.Decimal(subtotalSek),
        feeTotalSek: new Prisma.Decimal(feeTotalSek),
        totalSek: new Prisma.Decimal(totalSek),
        issuedAt,
        lineItems: toJsonLineItems(lineItems)
      }
    });

    await this.prisma.invoiceFee.deleteMany({
      where: { invoiceId: invoice.id }
    });

    if (fees.length > 0) {
      await this.prisma.invoiceFee.createMany({
        data: fees.map((fee) => ({
          id: fee.id,
          invoiceId: invoice.id,
          type: fee.type,
          label: fee.label,
          amountSek: new Prisma.Decimal(fee.amountSek)
        }))
      });
    }
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

  private persistedInvoiceToDto(invoice: PersistedInvoiceRecord): InvoiceDto {
    return {
      id: invoice.id,
      orderId: invoice.orderId,
      sellerId: invoice.sellerId,
      buyerId: invoice.buyerId,
      currency: invoice.currency as "SEK",
      status: invoice.status as "READY" | "EXPORTED",
      billedWeightKg: toNumber(invoice.billedWeightKg),
      subtotalSek: toNumber(invoice.subtotalSek),
      feeTotalSek: toNumber(invoice.feeTotalSek),
      totalSek: toNumber(invoice.totalSek),
      issuedAt: toIsoString(invoice.issuedAt),
      exportedAt: toIsoString(invoice.exportedAt),
      lineItems: parseLineItems(invoice.lineItems),
      fees: invoice.fees.map((fee) => ({
        id: fee.id,
        type: fee.type as FeeLineItem["type"],
        label: fee.label,
        amountSek: toNumber(fee.amountSek)
      }))
    };
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
