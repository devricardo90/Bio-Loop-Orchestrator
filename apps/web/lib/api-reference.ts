const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export type ApiReferenceTopic = {
  label: string;
  detail: string;
};

export function getApiReferenceHref() {
  return `${apiBaseUrl}/reference`;
}

export function getOpenApiJsonHref() {
  return `${apiBaseUrl}/openapi.json`;
}

export function getApiReferenceTopics(workspace: "buyer" | "pickup" | "admin-buyers" | "admin-disputes" | "seller-billing") {
  if (workspace === "buyer") {
    return [
      { label: "Buyer feed", detail: "Available lots, pricing, and buyer status" },
      { label: "Auction detail", detail: "Lot rules, timing, bids, and pickup handoff" },
      { label: "Submit bid", detail: "Bid validation and buyer approval rules" }
    ] satisfies ApiReferenceTopic[];
  }

  if (workspace === "pickup") {
    return [
      { label: "Pickup queue", detail: "Orders ready for scheduling and proof" },
      { label: "Schedule pickup", detail: "Pickup window checks and updates" },
      { label: "Submit POD", detail: "Proof upload and order closeout" }
    ] satisfies ApiReferenceTopic[];
  }

  if (workspace === "admin-buyers") {
    return [
      { label: "List buyers", detail: "Buyer access, catalog visibility, and review state" },
      { label: "Approve buyer", detail: "Approval, rejection, suspension, and reinstatement" }
    ] satisfies ApiReferenceTopic[];
  }

  if (workspace === "admin-disputes") {
    return [
      { label: "List disputes", detail: "Open exceptions, catalog context, and review status" },
      { label: "Resolve dispute", detail: "Settlement, cancellation, and escalation paths" }
    ] satisfies ApiReferenceTopic[];
  }

  return [
    { label: "Billing summary", detail: "Invoice count, fees, totals, and currency" },
    { label: "Billing export", detail: "Downloadable reporting snapshot" }
  ] satisfies ApiReferenceTopic[];
}
