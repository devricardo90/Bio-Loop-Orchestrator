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
  const status = record.order.status;
  const pickupStatus = record.order.pickupStatus;

  // Filtrar a timeline para evitar "passos fantasmas" ou repetidos
  const filteredTimeline = pickupTimeline.filter((step) => {
    if (status === "IN_DISPUTE") {
      return step !== "COMPLETED" && step !== "SETTLED" && step !== "CANCELLED";
    }
    if (status === "SETTLED" || pickupStatus === "COMPLETED") {
      return step !== "IN_DISPUTE" && step !== "CANCELLED";
    }
    if (status === "CANCELLED") {
      return step !== "COMPLETED" && step !== "SETTLED" && step !== "IN_DISPUTE" && step !== "SCHEDULED";
    }
    // No estado inicial, mostramos o caminho feliz por padrão, ocultando erros/disputas
    return step !== "IN_DISPUTE" && step !== "CANCELLED";
  });

  const currentIndex = getPickupCurrentIndex(record);

  return filteredTimeline.map((step) => {
    const index = pickupTimeline.indexOf(step);
    const tone =
      step === "COMPLETED" || step === "SETTLED"
        ? "awarded"
        : step === "IN_DISPUTE" || step === "CANCELLED"
          ? "void"
          : step === "SCHEDULED"
            ? "scheduled"
            : step === "CONFIRMED"
              ? "live"
              : "neutral";

    return {
      key: step,
      label:
        step === "CREATED"
          ? "Created"
          : step === "CONFIRMED"
            ? "Confirmed"
            : step === "SCHEDULED"
              ? "Pick-up scheduled"
              : step === "COMPLETED"
                ? "Pick-up completed"
                : step === "IN_DISPUTE"
                  ? "In dispute"
                  : step === "SETTLED"
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
    return "Pick-up completed";
  }

  if (record.order.pickupStatus === "SCHEDULED") {
    return "Pick-up scheduled";
  }

  return "Awaiting pick-up";
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
