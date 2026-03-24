import type { DemoAuctionRecord, DemoOrderRecord, DemoState } from "./demo-auctions";
import { formatSek, formatTimeWindow, getAuctionRuntime } from "./demo-auctions";

const pickupTimeline = [
  "CREATED",
  "CONFIRMED",
  "SCHEDULED",
  "COMPLETED",
  "IN_DISPUTE",
  "SETTLED",
  "CANCELLED"
] as const;

type PickupTimelineState = "complete" | "current" | "future";

export type PickupSummary = {
  pending: number;
  scheduled: number;
  completed: number;
  disputed: number;
  noShow: number;
};

export type PickupTimelineStep = {
  key: (typeof pickupTimeline)[number];
  label: string;
  state: PickupTimelineState;
  tone: "live" | "scheduled" | "awarded" | "ended" | "void" | "neutral";
};

export type PickupOrderRecord = DemoAuctionRecord & {
  order: DemoOrderRecord;
};

export function getPickupOrders(state: DemoState, activeBuyerId: string) {
  return state.auctions
    .filter((auction) => {
      const order = auction.order;
      if (!order) {
        return false;
      }

      return order.buyerId === activeBuyerId;
    })
    .map((auction) => auction as PickupOrderRecord)
    .sort((left, right) => {
      const leftPriority = getPickupPriority(left);
      const rightPriority = getPickupPriority(right);
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.storeName.localeCompare(right.storeName);
    });
}

export function getPickupSummary(records: PickupOrderRecord[]): PickupSummary {
  return {
    pending: records.filter((record) => record.order.pickupStatus === "PENDING").length,
    scheduled: records.filter((record) => record.order.pickupStatus === "SCHEDULED").length,
    completed: records.filter((record) => record.order.pickupStatus === "COMPLETED").length,
    disputed: records.filter((record) => record.order.status === "IN_DISPUTE").length,
    noShow: records.filter((record) => record.order.pickupStatus === "NO_SHOW").length
  };
}

export function getPickupSpotlight(records: PickupOrderRecord[], orderId?: string, mode: "list" | "detail" = "list") {
  if (orderId) {
    return records.find((record) => record.order.id === orderId) ?? null;
  }

  if (mode === "detail") {
    return (
      records.find((record) => record.order.pickupStatus === "SCHEDULED") ??
      records.find((record) => record.order.pickupStatus === "PENDING") ??
      records[0] ??
      null
    );
  }

  return records[0] ?? null;
}

export function getPickupTimeline(record: PickupOrderRecord): PickupTimelineStep[] {
  const currentIndex = getPickupCurrentIndex(record);

  return pickupTimeline.map((status, index) => {
    const tone =
      status === "COMPLETED" || status === "SETTLED"
        ? "awarded"
        : status === "IN_DISPUTE" || status === "CANCELLED"
          ? "void"
          : status === "SCHEDULED"
            ? "scheduled"
            : status === "CONFIRMED"
              ? "live"
              : "neutral";

    return {
      key: status,
      label:
        status === "CREATED"
          ? "Created"
          : status === "CONFIRMED"
            ? "Confirmed"
            : status === "SCHEDULED"
              ? "Pickup scheduled"
              : status === "COMPLETED"
                ? "Pickup completed"
                : status === "IN_DISPUTE"
                  ? "In dispute"
                  : status === "SETTLED"
                    ? "Settled"
                    : "Cancelled",
      state: index < currentIndex ? "complete" : index === currentIndex ? "current" : "future",
      tone
    };
  });
}

export function getPickupTone(record: PickupOrderRecord) {
  if (record.order.status === "IN_DISPUTE" || record.order.pickupStatus === "NO_SHOW") {
    return "void";
  }

  if (record.order.pickupStatus === "COMPLETED" || record.order.status === "SETTLED") {
    return "awarded";
  }

  if (record.order.pickupStatus === "SCHEDULED") {
    return "scheduled";
  }

  if (record.order.pickupStatus === "PENDING") {
    return "neutral";
  }

  return "live";
}

export function getPickupStatusLabel(record: PickupOrderRecord) {
  if (record.order.status === "IN_DISPUTE") {
    return "In dispute";
  }

  if (record.order.pickupStatus === "NO_SHOW") {
    return "No-show";
  }

  if (record.order.pickupStatus === "COMPLETED") {
    return "Pickup completed";
  }

  if (record.order.pickupStatus === "SCHEDULED") {
    return "Pickup scheduled";
  }

  return "Awaiting pickup";
}

export function getPickupStatusLine(record: PickupOrderRecord, now: number) {
  const runtime = getAuctionRuntime(record, now);

  if (record.order.status === "IN_DISPUTE") {
    return "Pickup missed or quality issue opened a dispute.";
  }

  if (record.order.pickupStatus === "NO_SHOW") {
    return "Pickup window elapsed without proof.";
  }

  if (record.order.pickupStatus === "COMPLETED") {
    return "Proof uploaded and order settled.";
  }

  if (record.order.pickupStatus === "SCHEDULED") {
    return `Pickup window is ${formatTimeWindow(getPickupWindow(record).startAt, getPickupWindow(record).endAt)}.`;
  }

  return runtime.timeLabel;
}

export function getPickupWindow(record: PickupOrderRecord) {
  return record.order.pickupWindow ?? record.lot.pickupWindow;
}

export function formatPickupRevenue(record: PickupOrderRecord) {
  const finalPrice = record.order.finalPriceSekPerKg;
  const weight = record.lot.finalWeightKg ?? record.lot.estimatedWeightKg;
  return formatSek(finalPrice * weight);
}

function getPickupCurrentIndex(record: PickupOrderRecord) {
  if (record.order.status === "IN_DISPUTE" || record.order.pickupStatus === "NO_SHOW") {
    return 4;
  }

  if (record.order.pickupStatus === "COMPLETED" || record.order.status === "SETTLED") {
    return 5;
  }

  if (record.order.pickupStatus === "SCHEDULED") {
    return 2;
  }

  if (record.order.status === "CONFIRMED") {
    return 1;
  }

  return 0;
}

function getPickupPriority(record: PickupOrderRecord) {
  if (record.order.status === "IN_DISPUTE" || record.order.pickupStatus === "NO_SHOW") {
    return 0;
  }

  if (record.order.pickupStatus === "SCHEDULED") {
    return 1;
  }

  if (record.order.pickupStatus === "PENDING") {
    return 2;
  }

  if (record.order.pickupStatus === "COMPLETED") {
    return 3;
  }

  return 4;
}
