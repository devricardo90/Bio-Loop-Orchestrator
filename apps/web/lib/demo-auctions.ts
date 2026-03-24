import type { AuctionDto, BidDto, Dispute, LotDto, OrderDto, PickupProof, PickupWindow } from "@bio-loop/domain";

export type DemoBuyer = {
  id: string;
  name: string;
  approved: boolean;
  reputation: number;
  note: string;
};

export type DemoAuctionRecord = {
  id: string;
  lot: LotDto;
  auction: AuctionDto;
  bids: BidDto[];
  order?: DemoOrderRecord;
  storeName: string;
  categoryName: string;
  distanceKm: number;
  summary: string;
  tags: string[];
};

export type DemoOrderRecord = OrderDto & {
  pickupWindow?: PickupWindow;
  pickupScheduledAt?: string | null;
  pickupCompletedAt?: string | null;
  pickupProof?: PickupProof | null;
  dispute?: Dispute | null;
};

export type DemoState = {
  buyers: DemoBuyer[];
  activeBuyerId: string;
  auctions: DemoAuctionRecord[];
  lastSyncedAt: string;
};

export type AuctionRuntime = {
  statusLabel: "LIVE" | "SCHEDULED" | "ENDED" | "VOID";
  statusTone: "live" | "scheduled" | "ended" | "void" | "awarded" | "neutral";
  timeLabel: string;
  canBid: boolean;
  bidFloor: number;
  countdownMs: number;
};

export const DEMO_STORAGE_KEY = "bio-loop-web-demo-state";
export const BID_INCREMENT = 0.25;

const now = new Date();
const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString();
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

export const currency = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 2
});

export function formatSek(value: number) {
  return currency.format(value).replace(/\u00a0/g, " ");
}

export function formatDistance(distanceKm: number) {
  return `${distanceKm.toFixed(1)} km`;
}

export function formatTimeWindow(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function formatCountdown(ms: number) {
  if (ms <= 0) {
    return "closing now";
  }

  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes < 60) {
    return `ends in ${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `ends in ${hours}h ${minutes}m` : `ends in ${hours}h`;
}

export function formatSyncTime(dateTime: string) {
  const elapsed = Date.now() - new Date(dateTime).getTime();
  if (elapsed < 60_000) {
    return "synced just now";
  }

  const minutes = Math.round(elapsed / 60_000);
  return `synced ${minutes}m ago`;
}

export function createDemoState(): DemoState {
  return {
    activeBuyerId: "buyer-grainworks",
    buyers: [
      {
        id: "buyer-grainworks",
        name: "GrainWorks AB",
        approved: true,
        reputation: 92,
        note: "Approved brewery feed buyer"
      },
      {
        id: "buyer-nova-brew",
        name: "Nova Brew Labs",
        approved: false,
        reputation: 43,
        note: "Pending approval"
      }
    ],
    auctions: [
      {
        id: "auction-husks-01",
        storeName: "Stockholm Central Market",
        categoryName: "Brewer's husk",
        distanceKm: 4.8,
        summary: "Dry malt husk from a morning cleanout. Ready for same-day pickup.",
        tags: ["LIVE", "DRY", "Same-day pickup"],
        lot: {
          id: "lot-husks-01",
          storeId: "store-stockholm-central",
          categoryId: "cat-brewer-husk",
          storageCondition: "DRY",
          pickupWindow: { startAt: inMinutes(-30), endAt: inMinutes(120) },
          estimatedWeightKg: 840,
          finalWeightKg: null,
          grade: "B",
          status: "LISTED"
        },
        auction: {
          id: "auction-husks-01",
          lotId: "lot-husks-01",
          reservePriceSekPerKg: 4.75,
          startAt: minutesAgo(30),
          endAt: inMinutes(42),
          status: "LIVE",
          highestBid: {
            id: "bid-husks-02",
            auctionId: "auction-husks-01",
            buyerId: "buyer-grainworks",
            priceSekPerKg: 5.1,
            createdAt: minutesAgo(7)
          }
        },
        bids: [
          {
            id: "bid-husks-01",
            auctionId: "auction-husks-01",
            buyerId: "buyer-nova-brew",
            priceSekPerKg: 4.9,
            createdAt: minutesAgo(14)
          },
          {
            id: "bid-husks-02",
            auctionId: "auction-husks-01",
            buyerId: "buyer-grainworks",
            priceSekPerKg: 5.1,
            createdAt: minutesAgo(7)
          }
        ]
      },
      {
        id: "auction-apples-01",
        storeName: "Sodermalm Supermarket",
        categoryName: "Apple pomace",
        distanceKm: 2.1,
        summary: "Cold pomace lot from the bakery wing. Scheduled for the evening route.",
        tags: ["SCHEDULED", "COLD", "Route window"],
        lot: {
          id: "lot-apples-01",
          storeId: "store-sodermalm",
          categoryId: "cat-pomace",
          storageCondition: "COLD",
          pickupWindow: { startAt: inMinutes(180), endAt: inMinutes(330) },
          estimatedWeightKg: 1250,
          finalWeightKg: null,
          grade: "A",
          status: "LISTED"
        },
        auction: {
          id: "auction-apples-01",
          lotId: "lot-apples-01",
          reservePriceSekPerKg: 3.4,
          startAt: inMinutes(18),
          endAt: inMinutes(78),
          status: "SCHEDULED",
          highestBid: null
        },
        bids: []
      },
      {
        id: "auction-carrots-01",
        storeName: "Norrmalm Fresh Depot",
        categoryName: "Carrot trim",
        distanceKm: 6.9,
        summary: "Awarded lot with pickup scheduled. The buyer already confirmed the window.",
        tags: ["AWARDED", "PICKUP SCHEDULED", "Confirmed"],
        lot: {
          id: "lot-carrots-01",
          storeId: "store-norrmalm",
          categoryId: "cat-carrot-trim",
          storageCondition: "FROZEN",
          pickupWindow: { startAt: inMinutes(90), endAt: inMinutes(150) },
          estimatedWeightKg: 560,
          finalWeightKg: 548,
          grade: "A",
          status: "PICKUP_SCHEDULED"
        },
        auction: {
          id: "auction-carrots-01",
          lotId: "lot-carrots-01",
          reservePriceSekPerKg: 6.2,
          startAt: minutesAgo(120),
          endAt: minutesAgo(20),
          status: "ENDED",
          highestBid: {
            id: "bid-carrots-02",
            auctionId: "auction-carrots-01",
            buyerId: "buyer-grainworks",
            priceSekPerKg: 6.8,
            createdAt: minutesAgo(26)
          }
        },
        bids: [
          {
            id: "bid-carrots-01",
            auctionId: "auction-carrots-01",
            buyerId: "buyer-nova-brew",
            priceSekPerKg: 6.4,
            createdAt: minutesAgo(34)
          },
          {
            id: "bid-carrots-02",
            auctionId: "auction-carrots-01",
            buyerId: "buyer-grainworks",
            priceSekPerKg: 6.8,
            createdAt: minutesAgo(26)
          }
        ],
        order: {
          id: "order-carrots-01",
          lotId: "lot-carrots-01",
          buyerId: "buyer-grainworks",
          finalPriceSekPerKg: 6.8,
          status: "CONFIRMED",
          pickupStatus: "SCHEDULED",
          pickupWindow: { startAt: inMinutes(90), endAt: inMinutes(150) },
          pickupScheduledAt: minutesAgo(25),
          pickupCompletedAt: null,
          pickupProof: null,
          dispute: null
        }
      },
      {
        id: "auction-greens-01",
        storeName: "Kungsholmen Organic Hall",
        categoryName: "Leafy trim",
        distanceKm: 1.6,
        summary: "Expired lot kept as a reference for the buyer feed and edge-state handling.",
        tags: ["VOID", "EXPIRED", "Edge state"],
        lot: {
          id: "lot-greens-01",
          storeId: "store-kungsholmen",
          categoryId: "cat-greens",
          storageCondition: "DRY",
          pickupWindow: { startAt: minutesAgo(90), endAt: minutesAgo(30) },
          estimatedWeightKg: 310,
          finalWeightKg: null,
          grade: "C",
          status: "EXPIRED"
        },
        auction: {
          id: "auction-greens-01",
          lotId: "lot-greens-01",
          reservePriceSekPerKg: 2.1,
          startAt: minutesAgo(80),
          endAt: minutesAgo(10),
          status: "VOID",
          highestBid: null
        },
        bids: []
      }
    ],
    lastSyncedAt: new Date().toISOString()
  };
}

export function getActiveBuyer(state: DemoState) {
  return state.buyers.find((buyer) => buyer.id === state.activeBuyerId) ?? state.buyers[0];
}

export function findAuction(state: DemoState, auctionId: string) {
  return state.auctions.find((auction) => auction.id === auctionId);
}

export function getFeaturedAuction(state: DemoState) {
  return state.auctions.find((auction) => auction.auction.status === "LIVE") ?? state.auctions[0];
}

export function getAuctionRuntime(record: DemoAuctionRecord, now: number): AuctionRuntime {
  const startAt = new Date(record.auction.startAt).getTime();
  const endAt = new Date(record.auction.endAt).getTime();
  const highestBid = record.auction.highestBid?.priceSekPerKg ?? 0;
  const minimumBid = Math.max(record.auction.reservePriceSekPerKg, highestBid + BID_INCREMENT);
  const countdownMs = endAt - now;

  if (record.auction.status === "VOID") {
    return { statusLabel: "VOID", statusTone: "void", timeLabel: "Auction voided", canBid: false, bidFloor: minimumBid, countdownMs };
  }

  if (record.auction.status === "ENDED" || now >= endAt) {
    return {
      statusLabel: "ENDED",
      statusTone: record.auction.highestBid ? "awarded" : "ended",
      timeLabel: record.auction.highestBid ? "Winning bid locked" : "Ended without reserve",
      canBid: false,
      bidFloor: minimumBid,
      countdownMs
    };
  }

  if (now < startAt) {
    return {
      statusLabel: "SCHEDULED",
      statusTone: "scheduled",
      timeLabel: formatCountdown(startAt - now),
      canBid: false,
      bidFloor: minimumBid,
      countdownMs: startAt - now
    };
  }

  return {
    statusLabel: "LIVE",
    statusTone: "live",
    timeLabel: formatCountdown(countdownMs),
    canBid: true,
    bidFloor: minimumBid,
    countdownMs
  };
}
