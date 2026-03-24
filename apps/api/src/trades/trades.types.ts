export interface StartAuctionInput {
  lotId: string;
  reservePriceSekPerKg: number;
  startAt: string;
  endAt: string;
}

export interface PlaceBidInput {
  auctionId: string;
  buyerId: string;
  priceSekPerKg: number;
}

export interface EndAuctionResult {
  auction: {
    id: string;
    lotId: string;
    status: string;
  };
  order: {
    id: string;
    lotId: string;
    buyerId: string;
    finalPriceSekPerKg: number;
    status: string;
    pickupStatus: string;
  } | null;
}
