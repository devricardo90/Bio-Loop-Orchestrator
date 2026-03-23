export const STORAGE_CONDITIONS = ["DRY", "COLD", "FROZEN"] as const;
export type StorageCondition = (typeof STORAGE_CONDITIONS)[number];

export const LOT_GRADES = ["A", "B", "C"] as const;
export type LotGrade = (typeof LOT_GRADES)[number];

export const LOT_STATUSES = [
  "DRAFT",
  "LISTED",
  "AWARDED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED"
] as const;
export type LotStatus = (typeof LOT_STATUSES)[number];

export const AUCTION_STATUSES = [
  "SCHEDULED",
  "LIVE",
  "ENDED",
  "VOID"
] as const;
export type AuctionStatus = (typeof AUCTION_STATUSES)[number];

export const ORDER_STATUSES = [
  "CREATED",
  "CONFIRMED",
  "IN_DISPUTE",
  "SETTLED",
  "CANCELLED"
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PICKUP_STATUSES = [
  "PENDING",
  "SCHEDULED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED"
] as const;
export type PickupStatus = (typeof PICKUP_STATUSES)[number];

export const DOMAIN_EVENTS = [
  "inventory_snapshot_ingested",
  "rule_threshold_met",
  "lot_created",
  "auction_started",
  "bid_placed",
  "auction_extended",
  "auction_ended",
  "order_created",
  "pickup_scheduled",
  "pickup_completed",
  "dispute_opened",
  "dispute_resolved",
  "invoice_ready"
] as const;
export type DomainEventName = (typeof DOMAIN_EVENTS)[number];

export interface PickupWindow {
  startAt: string;
  endAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  contacts: string[];
  pickupWindows: PickupWindow[];
}

export interface Buyer {
  id: string;
  name: string;
  approved: boolean;
  radiusKmDefault: number;
  reputation: number;
}

export interface CommodityCategory {
  id: string;
  name: string;
  storageCondition: StorageCondition;
  rulesDefault: string[];
}

export interface Lot {
  id: string;
  storeId: string;
  categoryId: string;
  storageCondition: StorageCondition;
  pickupWindow: PickupWindow;
  estimatedWeightKg: number;
  finalWeightKg: number | null;
  grade: LotGrade;
  status: LotStatus;
}

export interface Bid {
  id: string;
  auctionId: string;
  buyerId: string;
  priceSekPerKg: number;
  createdAt: string;
}

export interface Auction {
  id: string;
  lotId: string;
  startAt: string;
  endAt: string;
  reservePriceSekPerKg: number;
  status: AuctionStatus;
  highestBid: Bid | null;
}

export interface Order {
  id: string;
  lotId: string;
  buyerId: string;
  finalPriceSekPerKg: number;
  pickupStatus: PickupStatus;
  status: OrderStatus;
}

export interface PickupProof {
  id: string;
  orderId: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface LotDto {
  id: string;
  storeId: string;
  categoryId: string;
  storageCondition: StorageCondition;
  pickupWindow: PickupWindow;
  estimatedWeightKg: number;
  finalWeightKg: number | null;
  grade: LotGrade;
  status: LotStatus;
}

export interface AuctionDto {
  id: string;
  lotId: string;
  reservePriceSekPerKg: number;
  startAt: string;
  endAt: string;
  status: AuctionStatus;
  highestBid: BidDto | null;
}

export interface BidDto {
  id: string;
  auctionId: string;
  buyerId: string;
  priceSekPerKg: number;
  createdAt: string;
}

export interface OrderDto {
  id: string;
  lotId: string;
  buyerId: string;
  finalPriceSekPerKg: number;
  status: OrderStatus;
  pickupStatus: PickupStatus;
}

export interface CreateLotRequest {
  storeId: string;
  categoryId: string;
  storageCondition: StorageCondition;
  pickupWindow: PickupWindow;
  estimatedWeightKg: number;
  grade: LotGrade;
}

export interface CreateAuctionRequest {
  lotId: string;
  reservePriceSekPerKg: number;
  startAt: string;
  endAt: string;
}

export interface PlaceBidRequest {
  auctionId: string;
  buyerId: string;
  priceSekPerKg: number;
}

export interface PlaceBidResponse {
  bid: BidDto;
}

export interface SchedulePickupRequest {
  orderId: string;
  pickupWindow: PickupWindow;
}

export interface SchedulePickupResponse {
  order: OrderDto;
}
