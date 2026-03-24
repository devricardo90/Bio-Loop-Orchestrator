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

export interface PickupWindowInput {
  startAt: string;
  endAt: string;
}

export interface SchedulePickupInput {
  orderId: string;
  pickupWindow: PickupWindowInput;
}

export interface RecordPickupProofInput {
  orderId: string;
  type: string;
  url: string;
}

export interface PickupWindowDto {
  startAt: string;
  endAt: string;
}

export interface PickupProofDto {
  id: string;
  orderId: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface DisputeDto {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  openedAt: string;
  resolvedAt: string | null;
}

export interface SchedulePickupResult {
  order: {
    id: string;
    lotId: string;
    buyerId: string;
    finalPriceSekPerKg: number;
    status: string;
    pickupStatus: string;
    pickupWindow?: PickupWindowDto | null;
  };
}

export interface RecordPickupProofResult {
  order: {
    id: string;
    lotId: string;
    buyerId: string;
    finalPriceSekPerKg: number;
    status: string;
    pickupStatus: string;
    pickupWindow?: PickupWindowDto | null;
  };
  proof?: PickupProofDto;
  dispute?: DisputeDto;
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
    pickupWindow?: PickupWindowDto | null;
  } | null;
}
