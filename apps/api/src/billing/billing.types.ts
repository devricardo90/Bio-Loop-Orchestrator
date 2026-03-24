export type ExportFormat = "CSV" | "JSON";

export interface BillingRangeQuery {
  fromAt: string;
  toAt: string;
}

export interface FeeLineItem {
  id: string;
  type: "PLATFORM_PERCENT" | "PICKUP_FLAT" | "DISPUTE_FLAT" | "ADJUSTMENT";
  label: string;
  amountSek: number;
}

export interface InvoiceLineItem {
  id: string;
  label: string;
  quantityKg: number;
  unitPriceSekPerKg: number;
  amountSek: number;
}

export interface InvoiceDto {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  currency: "SEK";
  status: "READY" | "EXPORTED";
  billedWeightKg: number;
  subtotalSek: number;
  feeTotalSek: number;
  totalSek: number;
  issuedAt: string;
  exportedAt: string | null;
  lineItems: InvoiceLineItem[];
  fees: FeeLineItem[];
}

export interface BillingReport {
  fromAt: string;
  toAt: string;
  currency: "SEK";
  invoiceCount: number;
  subtotalSek: number;
  feeTotalSek: number;
  totalSek: number;
}

export interface BillingExportQuery extends BillingRangeQuery {
  format: ExportFormat;
}

export interface BillingExportResult {
  format: ExportFormat;
  downloadName: string;
  invoiceCount: number;
  report: BillingReport;
  invoices: InvoiceDto[];
  content: string;
}

export interface BillingSummaryResult {
  report: BillingReport;
  invoices: InvoiceDto[];
}
