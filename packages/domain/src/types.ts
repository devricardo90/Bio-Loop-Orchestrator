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

export const DISPUTE_STATUSES = ["OPEN", "RESOLVED", "CANCELLED"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_REASONS = ["NO_SHOW", "QUALITY_ISSUE"] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const BUYER_APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED"
] as const;
export type BuyerApprovalStatus = (typeof BUYER_APPROVAL_STATUSES)[number];

export const BUYER_APPROVAL_DECISIONS = [
  "APPROVE",
  "REJECT",
  "SUSPEND",
  "REINSTATE"
] as const;
export type BuyerApprovalDecision = (typeof BUYER_APPROVAL_DECISIONS)[number];

export const BUYER_APPROVAL_REASONS = [
  "AUTO_APPROVAL",
  "LOW_REPUTATION",
  "PAYMENT_RISK",
  "COMPLIANCE",
  "MANUAL_REVIEW"
] as const;
export type BuyerApprovalReason = (typeof BUYER_APPROVAL_REASONS)[number];

export const DISPUTE_RESOLUTION_DECISIONS = [
  "SETTLE",
  "CANCEL_ORDER",
  "ESCALATE"
] as const;
export type DisputeResolutionDecision = (typeof DISPUTE_RESOLUTION_DECISIONS)[number];

export const INVOICE_STATUSES = [
  "DRAFT",
  "READY",
  "EXPORTED",
  "SETTLED",
  "CANCELLED"
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const FEE_TYPES = [
  "PLATFORM_PERCENT",
  "PICKUP_FLAT",
  "DISPUTE_FLAT",
  "ADJUSTMENT"
] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export const EXPORT_FORMATS = ["CSV", "JSON"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

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

export interface BuyerApprovalPolicy {
  minReputation: number;
  maxOpenDisputes: number;
  maxPendingDays: number;
  autoApproveEnabled: boolean;
  manualReviewRequired: boolean;
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

export interface Dispute {
  id: string;
  orderId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  openedAt: string;
  resolvedAt: string | null;
}

export interface BuyerApproval {
  id: string;
  buyerId: string;
  status: BuyerApprovalStatus;
  decision: BuyerApprovalDecision | null;
  reason: BuyerApprovalReason | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeResolutionPolicy {
  defaultDecision: DisputeResolutionDecision;
  allowEscalation: boolean;
  requireReviewerNote: boolean;
}

export interface DisputeResolution {
  id: string;
  disputeId: string;
  decision: DisputeResolutionDecision;
  reviewerId: string | null;
  note: string | null;
  resolvedAt: string;
}

export interface FeeLineItem {
  id: string;
  type: FeeType;
  label: string;
  amountSek: number;
}

export interface InvoiceLineItem {
  id: string;
  label: string;
  quantityKg: number;
  unitPriceSekPerKg: number;
  amountSek: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  currency: "SEK";
  status: InvoiceStatus;
  billedWeightKg: number;
  subtotalSek: number;
  feeTotalSek: number;
  totalSek: number;
  issuedAt: string;
  exportedAt: string | null;
}

export interface InvoiceDto {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  currency: "SEK";
  status: InvoiceStatus;
  billedWeightKg: number;
  subtotalSek: number;
  feeTotalSek: number;
  totalSek: number;
  issuedAt: string;
  exportedAt: string | null;
  lineItems: InvoiceLineItem[];
  fees: FeeLineItem[];
}

export interface BillingReport {
  fromAt: string;
  toAt: string;
  currency: "SEK";
  invoiceCount: number;
  subtotalSek: number;
  feeTotalSek: number;
  totalSek: number;
}

export interface InvoiceExportRequest {
  fromAt: string;
  toAt: string;
  format: ExportFormat;
}

export interface InvoiceExportResponse {
  format: ExportFormat;
  downloadName: string;
  invoiceCount: number;
  report: BillingReport;
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

export interface DisputeDto {
  id: string;
  orderId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  openedAt: string;
  resolvedAt: string | null;
}

export interface BuyerApprovalDto {
  id: string;
  buyerId: string;
  status: BuyerApprovalStatus;
  decision: BuyerApprovalDecision | null;
  reason: BuyerApprovalReason | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface OpenDisputeRequest {
  orderId: string;
  reason: DisputeReason;
}

export interface OpenDisputeResponse {
  dispute: DisputeDto;
}

export interface ResolveDisputeRequest {
  disputeId: string;
  decision: DisputeResolutionDecision;
  note?: string;
}

export interface ResolveDisputeResponse {
  dispute: DisputeDto;
}

export interface ApproveBuyerRequest {
  buyerId: string;
  decision: BuyerApprovalDecision;
  reason: BuyerApprovalReason;
  notes?: string;
}

export interface ApproveBuyerResponse {
  approval: BuyerApprovalDto;
}
