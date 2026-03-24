import { unprocessableError } from "./trade.errors";
import type { PlaceBidInput } from "./trades.types";

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
