import type { DemoAuctionRecord, DemoState } from "./demo-auctions";
import { formatSek, getAuctionRuntime } from "./demo-auctions";

const lotStatusOrder: Record<DemoAuctionRecord["lot"]["status"], number> = {
  DRAFT: 0,
  LISTED: 1,
  AWARDED: 2,
  PICKUP_SCHEDULED: 3,
  PICKED_UP: 4,
  COMPLETED: 5,
  CANCELLED: 6,
  EXPIRED: 7
} as const;

const lotTimeline = [
  "DRAFT",
  "LISTED",
  "AWARDED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED"
] as const;

type TimelineState = "complete" | "current" | "future";

export type SellerSummary = {
  listed: number;
  live: number;
  awarded: number;
  settled: number;
  voided: number;
  projectedRevenue: number;
};

export type SellerTimelineStep = {
  key: (typeof lotTimeline)[number];
  label: string;
  state: TimelineState;
  tone: "live" | "scheduled" | "awarded" | "ended" | "void" | "neutral";
};

function getLotOrder(status: DemoAuctionRecord["lot"]["status"]) {
  return lotStatusOrder[status];
}

function getLotTone(record: DemoAuctionRecord) {
  if (record.lot.status === "COMPLETED" || record.lot.status === "PICKED_UP") {
    return "awarded";
  }

  if (record.lot.status === "AWARDED" || record.lot.status === "PICKUP_SCHEDULED") {
    return "awarded";
  }

  if (record.auction.status === "LIVE") {
    return "live";
  }

  if (record.auction.status === "SCHEDULED" || record.lot.status === "LISTED") {
    return "scheduled";
  }

  if (record.auction.status === "VOID" || record.lot.status === "CANCELLED" || record.lot.status === "EXPIRED") {
    return "void";
  }

  return "ended";
}

export function getSellerRecords(state: DemoState) {
  return [...state.auctions].sort((left, right) => {
    const statusDelta = getLotOrder(left.lot.status) - getLotOrder(right.lot.status);
    if (statusDelta !== 0) {
      return statusDelta;
    }

    return left.storeName.localeCompare(right.storeName);
  });
}

export function getSellerSummary(records: DemoAuctionRecord[]): SellerSummary {
  return {
    listed: records.filter((record) => record.lot.status === "LISTED" || record.auction.status === "SCHEDULED").length,
    live: records.filter((record) => record.auction.status === "LIVE").length,
    awarded: records.filter((record) => record.lot.status === "AWARDED" || record.lot.status === "PICKUP_SCHEDULED").length,
    settled: records.filter((record) => record.lot.status === "PICKED_UP" || record.lot.status === "COMPLETED").length,
    voided: records.filter((record) => record.auction.status === "VOID" || record.lot.status === "EXPIRED").length,
    projectedRevenue: records.reduce((total, record) => {
      const value = record.order?.finalPriceSekPerKg ?? record.auction.highestBid?.priceSekPerKg ?? 0;
      const weight = record.lot.finalWeightKg ?? record.lot.estimatedWeightKg;

      if (record.lot.status === "COMPLETED" || record.lot.status === "PICKED_UP" || record.lot.status === "PICKUP_SCHEDULED") {
        return total + value * weight;
      }

      return total;
    }, 0)
  };
}

export function getSellerSpotlight(records: DemoAuctionRecord[], lotId?: string, mode: "lots" | "results" = "lots") {
  if (lotId) {
    return records.find((record) => record.id === lotId) ?? null;
  }

  if (mode === "results") {
    return (
      records.find((record) => record.lot.status === "COMPLETED") ??
      records.find((record) => record.lot.status === "PICKUP_SCHEDULED") ??
      records.find((record) => record.auction.status === "ENDED") ??
      records[0] ??
      null
    );
  }

  return (
    records.find((record) => record.auction.status === "LIVE") ??
    records.find((record) => record.auction.status === "SCHEDULED") ??
    records[0] ??
    null
  );
}

export function getSellerTimeline(record: DemoAuctionRecord): SellerTimelineStep[] {
  const currentIndex = lotTimeline.indexOf(record.lot.status);

  return lotTimeline.map((status, index) => {
    const tone = status === "AWARDED" || status === "PICKUP_SCHEDULED" || status === "PICKED_UP" || status === "COMPLETED"
      ? "awarded"
      : status === "CANCELLED" || status === "EXPIRED"
        ? "void"
        : status === "LISTED"
          ? "scheduled"
          : status === "DRAFT"
            ? "neutral"
            : "ended";

    return {
      key: status,
      label:
        status === "DRAFT"
          ? "Draft"
          : status === "LISTED"
            ? "Listed"
            : status === "AWARDED"
              ? "Awarded"
              : status === "PICKUP_SCHEDULED"
                ? "Pickup scheduled"
                : status === "PICKED_UP"
                  ? "Picked up"
                  : status === "COMPLETED"
                    ? "Completed"
                    : status === "CANCELLED"
                      ? "Cancelled"
                      : "Expired",
      state: index < currentIndex ? "complete" : index === currentIndex ? "current" : "future",
      tone
    };
  });
}

export function getSellerOutcomeLabel(record: DemoAuctionRecord) {
  if (record.lot.status === "COMPLETED") {
    return "Settled";
  }

  if (record.lot.status === "PICKUP_SCHEDULED") {
    return "Pickup scheduled";
  }

  if (record.lot.status === "AWARDED") {
    return "Awarded";
  }

  if (record.auction.status === "LIVE") {
    return "Live";
  }

  if (record.auction.status === "VOID" || record.lot.status === "EXPIRED" || record.lot.status === "CANCELLED") {
    return "Void";
  }

  return "Scheduled";
}

export function getSellerRevenueValue(record: DemoAuctionRecord) {
  const price = record.order?.finalPriceSekPerKg ?? record.auction.highestBid?.priceSekPerKg ?? 0;
  const weight = record.lot.finalWeightKg ?? record.lot.estimatedWeightKg;
  return price * weight;
}

export function formatSellerRevenue(record: DemoAuctionRecord) {
  return formatSek(getSellerRevenueValue(record));
}

export function getSellerTone(record: DemoAuctionRecord) {
  return getLotTone(record);
}

export function formatSellerStatusLine(record: DemoAuctionRecord) {
  const runtime = getAuctionRuntime(record, Date.now());

  if (record.lot.status === "COMPLETED") {
    return "Sold and settled";
  }

  if (record.lot.status === "PICKUP_SCHEDULED") {
    return "Awaiting pickup completion";
  }

  if (record.lot.status === "AWARDED") {
    return "Winner assigned and pickup pending";
  }

  if (record.auction.status === "LIVE") {
    return `Live with ${runtime.timeLabel}`;
  }

  if (record.auction.status === "VOID") {
    return "Auction voided";
  }

  return runtime.timeLabel;
}
