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

export interface BuyerWorkspaceBuyerDto {
  id: string;
  name: string;
  approved: boolean;
  reputation: number;
  note: string;
}

export interface BuyerWorkspaceLotDto {
  id: string;
  storeId: string;
  categoryId: string;
  storageCondition: string;
  pickupWindow: PickupWindowDto;
  estimatedWeightKg: number;
  finalWeightKg: number | null;
  grade: string;
  status: string;
}

export interface BuyerWorkspaceBidDto {
  id: string;
  auctionId: string;
  buyerId: string;
  priceSekPerKg: number;
  createdAt: string;
}

export interface BuyerWorkspaceAuctionDto {
  id: string;
  lotId: string;
  reservePriceSekPerKg: number;
  startAt: string;
  endAt: string;
  status: string;
  highestBid: BuyerWorkspaceBidDto | null;
}

export interface BuyerWorkspaceOrderDto {
  id: string;
  lotId: string;
  buyerId: string;
  finalPriceSekPerKg: number;
  status: string;
  pickupStatus: string;
  pickupWindow?: PickupWindowDto | null;
  pickupScheduledAt?: string | null;
  pickupCompletedAt?: string | null;
  pickupProof?: PickupProofDto | null;
  dispute?: DisputeDto | null;
}

export interface BuyerWorkspaceAuctionRecordDto {
  id: string;
  lot: BuyerWorkspaceLotDto;
  auction: BuyerWorkspaceAuctionDto;
  bids: BuyerWorkspaceBidDto[];
  order?: BuyerWorkspaceOrderDto;
  storeName: string;
  categoryName: string;
  distanceKm: number;
  summary: string;
  tags: string[];
}

export interface BuyerFeedResult {
  buyers: BuyerWorkspaceBuyerDto[];
  activeBuyerId: string;
  auctions: BuyerWorkspaceAuctionRecordDto[];
  lastSyncedAt: string;
  source: "api";
}

export interface BuyerAuctionDetailResult {
  buyers: BuyerWorkspaceBuyerDto[];
  activeBuyerId: string;
  auction: BuyerWorkspaceAuctionRecordDto;
  relatedAuctions: BuyerWorkspaceAuctionRecordDto[];
  lastSyncedAt: string;
  source: "api";
}
