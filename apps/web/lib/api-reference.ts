const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export type ApiReferenceTopic = {
  label: string;
  endpoint: string;
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
      { label: "Buyer feed", endpoint: "GET /buyer/auctions/feed" },
      { label: "Auction detail", endpoint: "GET /buyer/auctions/:auctionId" },
      { label: "Submit bid", endpoint: "POST /buyer/auctions/:auctionId/bids" }
    ] satisfies ApiReferenceTopic[];
  }

  if (workspace === "pickup") {
    return [
      { label: "Pickup queue", endpoint: "GET /buyer/auctions/feed" },
      { label: "Schedule pickup", endpoint: "POST /buyer/orders/:orderId/schedule-pickup" },
      { label: "Submit POD", endpoint: "POST /buyer/orders/:orderId/pod" }
    ] satisfies ApiReferenceTopic[];
  }

  if (workspace === "admin-buyers") {
    return [
      { label: "List buyers", endpoint: "GET /admin/buyers" },
      { label: "Approve buyer", endpoint: "POST /admin/buyers/:buyerId/approve" }
    ] satisfies ApiReferenceTopic[];
  }

  if (workspace === "admin-disputes") {
    return [
      { label: "List disputes", endpoint: "GET /admin/disputes" },
      { label: "Resolve dispute", endpoint: "POST /admin/disputes/:disputeId/resolve" }
    ] satisfies ApiReferenceTopic[];
  }

  return [
    { label: "Billing summary", endpoint: "GET /seller/reports/summary" },
    { label: "Billing export", endpoint: "GET /seller/reports/export" }
  ] satisfies ApiReferenceTopic[];
}
