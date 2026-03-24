const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export type BillingSummary = {
  fromAt: string;
  toAt: string;
  currency: string;
  invoiceCount: number;
  subtotalSek: number;
  feeTotalSek: number;
  totalSek: number;
};

export type BillingInvoice = {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  currency: string;
  status: string;
  billedWeightKg: number;
  subtotalSek: number;
  feeTotalSek: number;
  totalSek: number;
  issuedAt: string;
  exportedAt: string | null;
  lineItems: Array<{
    id: string;
    label: string;
    quantityKg: number;
    unitPriceSekPerKg: number;
    amountSek: number;
  }>;
  fees: Array<{
    id: string;
    type: string;
    label: string;
    amountSek: number;
  }>;
};

export type BillingExportFormat = "CSV" | "JSON";

export type BillingExportSnapshot = {
  format: BillingExportFormat;
  downloadName: string;
  invoiceCount: number;
  report: BillingSummary;
  invoices: BillingInvoice[];
  content: string;
};

export async function fetchBillingSummary(range: { fromAt: string; toAt: string }) {
  const url = new URL(`${apiBaseUrl}/seller/reports/summary`);
  url.searchParams.set("fromAt", range.fromAt);
  url.searchParams.set("toAt", range.toAt);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Billing summary request failed with ${response.status}`);
  }

  return (await response.json()) as BillingSummary;
}

export async function fetchBillingExport(range: { fromAt: string; toAt: string }, format: BillingExportFormat) {
  const url = new URL(`${apiBaseUrl}/seller/reports/export`);
  url.searchParams.set("fromAt", range.fromAt);
  url.searchParams.set("toAt", range.toAt);
  url.searchParams.set("format", format);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Billing export request failed with ${response.status}`);
  }

  return (await response.json()) as BillingExportSnapshot;
}
