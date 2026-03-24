"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { BidDto, Dispute, PickupProof, PickupWindow } from "@bio-loop/domain";
import { submitBidToApi } from "../lib/bid-api";
import { schedulePickupToApi, submitPodToApi } from "../lib/pickup-api";
import {
  createDemoState,
  DEMO_STORAGE_KEY,
  getActiveBuyer,
  type DemoOrderRecord,
  type DemoState
} from "../lib/demo-auctions";

type AuctionStoreContextValue = {
  state: DemoState;
  now: number;
  activeBuyerId: string;
  activeBuyerName: string;
  activeBuyerApproved: boolean;
  setActiveBuyerId: (buyerId: string) => void;
  submitBid: (input: { auctionId: string; priceSekPerKg: number }) => Promise<BidSubmitResult>;
  schedulePickup: (input: { orderId: string; pickupWindow: PickupWindow }) => Promise<PickupActionResult>;
  submitPod: (input: { orderId: string; type: string; url: string }) => Promise<PickupActionResult>;
  hydrated: boolean;
};

export type BidSubmitResult =
  | { ok: true; bid: BidDto; source: "api" | "demo" }
  | { ok: false; error: string };

export type PickupActionResult =
  | { ok: true; order: DemoOrderRecord; source: "api" | "demo"; proof?: PickupProof; dispute?: Dispute }
  | { ok: false; error: string };

const AuctionStoreContext = createContext<AuctionStoreContextValue | null>(null);

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return createDemoState();
  }

  const raw = window.sessionStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) {
    return createDemoState();
  }

  try {
    return JSON.parse(raw) as DemoState;
  } catch {
    return createDemoState();
  }
}

function updateOrderRecord(
  state: DemoState,
  orderId: string,
  updater: (order: DemoOrderRecord) => DemoOrderRecord
) {
  return {
    ...state,
    auctions: state.auctions.map((auction) => {
      if (auction.order?.id !== orderId) {
        return auction;
      }

      return {
        ...auction,
        order: updater(auction.order)
      };
    })
  };
}

function updateOrderAndLotRecord(
  state: DemoState,
  orderId: string,
  updater: (order: DemoOrderRecord) => DemoOrderRecord,
  lotStatus?: "PICKUP_SCHEDULED" | "COMPLETED"
) {
  return {
    ...state,
    auctions: state.auctions.map((auction) => {
      if (auction.order?.id !== orderId) {
        return auction;
      }

      return {
        ...auction,
        lot: lotStatus ? { ...auction.lot, status: lotStatus } : auction.lot,
        order: updater(auction.order)
      };
    })
  };
}

export function AuctionStoreProvider({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const [state, setState] = useState<DemoState>(() => createDemoState());
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const activeBuyer = getActiveBuyer(state);

  const value = useMemo<AuctionStoreContextValue>(
    () => ({
      state,
      now,
      activeBuyerId: activeBuyer.id,
      activeBuyerName: activeBuyer.name,
      activeBuyerApproved: activeBuyer.approved,
      hydrated,
      setActiveBuyerId: (buyerId) => {
        setState((current) => ({
          ...current,
          activeBuyerId: buyerId,
          lastSyncedAt: new Date().toISOString()
        }));
      },
      submitBid: async ({ auctionId, priceSekPerKg }) => {
        const buyer = getActiveBuyer(state);
        const createdAt = new Date().toISOString();
        const tempBid: BidDto = {
          id: `local-${Date.now()}`,
          auctionId,
          buyerId: buyer.id,
          priceSekPerKg,
          createdAt
        };

        setState((current) => ({
          ...current,
          auctions: current.auctions.map((auction) => {
            if (auction.id !== auctionId) {
              return auction;
            }

            const bids = [...auction.bids, tempBid].sort((a, b) => a.priceSekPerKg - b.priceSekPerKg);
            const highestBid = bids[bids.length - 1] ?? null;

            return {
              ...auction,
              bids,
              auction: {
                ...auction.auction,
                highestBid
              }
            };
          }),
          lastSyncedAt: createdAt
        }));

        try {
          const response = await submitBidToApi({
            auctionId,
            buyerId: buyer.id,
            priceSekPerKg
          });

          const acceptedBid = response.bid;
          setState((current) => ({
            ...current,
            auctions: current.auctions.map((auction) => {
              if (auction.id !== auctionId) {
                return auction;
              }

              const bids = auction.bids.map((bid) => (bid.id === tempBid.id ? acceptedBid : bid));
              const highestBid = bids[bids.length - 1] ?? null;

              return {
                ...auction,
                bids,
                auction: {
                  ...auction.auction,
                  highestBid
                }
              };
            }),
            lastSyncedAt: new Date().toISOString()
          }));

          return { ok: true, bid: acceptedBid, source: "api" as const };
        } catch {
          return { ok: true, bid: tempBid, source: "demo" as const };
        }
      },
      schedulePickup: async ({ orderId, pickupWindow }) => {
        const scheduledAt = new Date().toISOString();

        setState((current) =>
          updateOrderAndLotRecord(current, orderId, (order) => ({
            ...order,
            pickupWindow,
            pickupScheduledAt: scheduledAt,
            pickupCompletedAt: null,
            pickupProof: null,
            dispute: null,
            status: "CONFIRMED",
            pickupStatus: "SCHEDULED"
          }), "PICKUP_SCHEDULED")
        );

        try {
          const response = await schedulePickupToApi({ orderId, pickupWindow });
          const acceptedOrder = response.order;

          setState((current) =>
            updateOrderAndLotRecord(current, orderId, (order) => ({
              ...order,
              ...acceptedOrder,
              pickupWindow,
              pickupScheduledAt: scheduledAt,
              pickupCompletedAt: null,
              pickupProof: null,
              dispute: null
            }), "PICKUP_SCHEDULED")
          );

          return {
            ok: true,
            order: {
              ...(state.auctions.find((auction) => auction.order?.id === orderId)?.order ?? acceptedOrder),
              ...acceptedOrder,
              pickupWindow,
              pickupScheduledAt: scheduledAt,
              pickupCompletedAt: null,
              pickupProof: null,
              dispute: null
            },
            source: "api" as const
          };
        } catch {
          const fallbackOrder = state.auctions.find((auction) => auction.order?.id === orderId)?.order;
          if (!fallbackOrder) {
            return { ok: false, error: "Pickup order not found in demo state." };
          }

          const nextOrder = {
            ...fallbackOrder,
            pickupWindow,
            pickupScheduledAt: scheduledAt,
            pickupCompletedAt: null,
            pickupProof: null,
            dispute: null,
            status: "CONFIRMED",
            pickupStatus: "SCHEDULED"
          } satisfies DemoOrderRecord;

          setState((current) => updateOrderAndLotRecord(current, orderId, () => nextOrder, "PICKUP_SCHEDULED"));

          return { ok: true, order: nextOrder, source: "demo" as const };
        }
      },
      submitPod: async ({ orderId, type, url }) => {
        const createdAt = new Date().toISOString();
        const targetOrder = state.auctions.find((auction) => auction.order?.id === orderId)?.order;

        if (!targetOrder) {
          return { ok: false, error: "Pickup order not found in demo state." };
        }

        const scheduledWindow = targetOrder.pickupWindow ?? state.auctions.find((auction) => auction.order?.id === orderId)?.lot.pickupWindow;
        const isLate = scheduledWindow ? new Date(scheduledWindow.endAt).getTime() < Date.now() : false;

        if (isLate) {
          const dispute: Dispute = {
            id: `dispute-${Date.now()}`,
            orderId,
            reason: "NO_SHOW",
            status: "OPEN",
            openedAt: createdAt,
            resolvedAt: null
          };

          const nextOrder = {
            ...targetOrder,
            pickupStatus: "NO_SHOW",
            status: "IN_DISPUTE",
            dispute
          } satisfies DemoOrderRecord;

          setState((current) => updateOrderAndLotRecord(current, orderId, () => nextOrder, "PICKUP_SCHEDULED"));

          try {
            const response = await submitPodToApi({ orderId, type, url });
            const maybeDispute = response.dispute;
            const next = {
              ...nextOrder,
              dispute: maybeDispute
                ? {
                    id: maybeDispute.id,
                    orderId: maybeDispute.orderId,
                    reason: maybeDispute.reason === "QUALITY_ISSUE" ? "QUALITY_ISSUE" : "NO_SHOW",
                    status: maybeDispute.status === "RESOLVED" ? "RESOLVED" : "OPEN",
                    openedAt: maybeDispute.openedAt,
                    resolvedAt: maybeDispute.resolvedAt
                  }
                : dispute
            } satisfies DemoOrderRecord;

            setState((current) => updateOrderAndLotRecord(current, orderId, () => next, "PICKUP_SCHEDULED"));
            return { ok: true, order: next, source: "api" as const, dispute: next.dispute ?? undefined };
          } catch {
            return { ok: true, order: nextOrder, source: "demo" as const, dispute };
          }
        }

        const proof: PickupProof = {
          id: `pod-${Date.now()}`,
          orderId,
          type,
          url,
          createdAt
        };

        const nextOrder = {
          ...targetOrder,
          pickupCompletedAt: createdAt,
          pickupProof: proof,
          status: "SETTLED",
          pickupStatus: "COMPLETED"
        } satisfies DemoOrderRecord;

        setState((current) => updateOrderAndLotRecord(current, orderId, () => nextOrder, "COMPLETED"));

        try {
          const response = await submitPodToApi({ orderId, type, url });
          const next = {
            ...nextOrder,
            pickupProof: response.proof ?? proof
          } satisfies DemoOrderRecord;

          setState((current) => updateOrderAndLotRecord(current, orderId, () => next, "COMPLETED"));

          return { ok: true, order: next, source: "api" as const, proof: next.pickupProof ?? undefined };
        } catch {
          return { ok: true, order: nextOrder, source: "demo" as const, proof };
        }
      }
    }),
    [activeBuyer.approved, activeBuyer.id, activeBuyer.name, hydrated, now, state]
  );

  return <AuctionStoreContext.Provider value={value}>{children}</AuctionStoreContext.Provider>;
}

export function useAuctionStore() {
  const value = useContext(AuctionStoreContext);
  if (!value) {
    throw new Error("useAuctionStore must be used within AuctionStoreProvider");
  }

  return value;
}
