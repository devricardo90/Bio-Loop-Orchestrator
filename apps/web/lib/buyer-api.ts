import type { BidDto } from "@bio-loop/domain";
import type { DemoAuctionRecord, DemoBuyer, DemoState } from "./demo-auctions";

const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export type BuyerFeedResponse = DemoState & {
  source: "api";
};

export type BuyerAuctionDetailResponse = {
  buyers: DemoBuyer[];
  activeBuyerId: string;
  auction: DemoAuctionRecord;
  relatedAuctions: DemoAuctionRecord[];
  lastSyncedAt: string;
  source: "api";
};

export type BuyerBidSubmitResult =
  | { ok: true; bid: BidDto; source: "api" }
  | { ok: false; error: string };

export async function fetchBuyerFeed() {
  const response = await fetch(`${apiBaseUrl}/buyer/auctions/feed`, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Buyer feed request failed with ${response.status}`);
  }

  return (await response.json()) as BuyerFeedResponse;
}

export async function fetchBuyerAuctionDetail(auctionId: string) {
  const response = await fetch(`${apiBaseUrl}/buyer/auctions/${auctionId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Buyer auction detail request failed with ${response.status}`);
  }

  return (await response.json()) as BuyerAuctionDetailResponse;
}
