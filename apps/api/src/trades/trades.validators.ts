import { unprocessableError } from "./trade.errors";
import type {
  PlaceBidInput,
  RecordPickupProofInput,
  SchedulePickupInput
} from "./trades.types";

export function normalizePlaceBidInput(input: unknown): PlaceBidInput {
  if (!input || typeof input !== "object") {
    unprocessableError("INVALID_BID_REQUEST", "Bid request must be an object");
  }

  const raw = input as Record<string, unknown>;
  const auctionIdValue = raw["auctionId"];
  const buyerIdValue = raw["buyerId"];
  const priceValue = raw["priceSekPerKg"];
  const auctionId = typeof auctionIdValue === "string" ? auctionIdValue.trim() : "";
  const buyerId = typeof buyerIdValue === "string" ? buyerIdValue.trim() : "";
  const priceSekPerKg = Number(priceValue);

  if (!auctionId || !buyerId || !Number.isFinite(priceSekPerKg) || priceSekPerKg <= 0) {
    unprocessableError("INVALID_BID_REQUEST", "auctionId, buyerId and priceSekPerKg are required");
  }

  return {
    auctionId,
    buyerId,
    priceSekPerKg
  };
}

export function normalizeSchedulePickupInput(input: unknown): SchedulePickupInput {
  if (!input || typeof input !== "object") {
    unprocessableError("INVALID_SCHEDULE_PICKUP_REQUEST", "Schedule pickup request must be an object");
  }

  const raw = input as Record<string, unknown>;
  const pickupWindowValue = raw["pickupWindow"];

  if (!pickupWindowValue || typeof pickupWindowValue !== "object") {
    unprocessableError("INVALID_SCHEDULE_PICKUP_REQUEST", "pickupWindow is required");
  }

  const windowRaw = pickupWindowValue as Record<string, unknown>;
  const startAtValue = windowRaw["startAt"];
  const endAtValue = windowRaw["endAt"];
  const startAt = typeof startAtValue === "string" ? startAtValue.trim() : "";
  const endAt = typeof endAtValue === "string" ? endAtValue.trim() : "";

  if (!startAt || !endAt) {
    unprocessableError("INVALID_SCHEDULE_PICKUP_REQUEST", "pickupWindow.startAt and pickupWindow.endAt are required");
  }

  return {
    orderId: typeof raw["orderId"] === "string" ? raw["orderId"].trim() : "",
    pickupWindow: {
      startAt,
      endAt
    }
  };
}

export function normalizeRecordPickupInput(input: unknown): RecordPickupProofInput {
  if (!input || typeof input !== "object") {
    unprocessableError("INVALID_POD_REQUEST", "POD request must be an object");
  }

  const raw = input as Record<string, unknown>;
  const typeValue = raw["type"];
  const urlValue = raw["url"];
  const type = typeof typeValue === "string" ? typeValue.trim() : "";
  const url = typeof urlValue === "string" ? urlValue.trim() : "";

  if (!type || !url) {
    unprocessableError("INVALID_POD_REQUEST", "type and url are required");
  }

  return {
    orderId: typeof raw["orderId"] === "string" ? raw["orderId"].trim() : "",
    type,
    url
  };
}
