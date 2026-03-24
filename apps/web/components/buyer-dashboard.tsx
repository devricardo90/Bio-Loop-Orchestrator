"use client";

import Link from "next/link";
import { useState } from "react";
import { BidPanel } from "./bid-panel";
import { useAuctionStore } from "./auction-store";
import {
  formatCountdown,
  formatDistance,
  formatSek,
  formatSyncTime,
  formatTimeWindow,
  getAuctionRuntime,
  getFeaturedAuction,
  type DemoAuctionRecord
} from "../lib/demo-auctions";

type BuyerDashboardProps = {
  mode: "feed" | "auction";
  auctionId?: string;
};

const filters = ["ALL", "LIVE", "SCHEDULED", "ENDED", "VOID"] as const;

export function BuyerDashboard({ mode, auctionId }: BuyerDashboardProps) {
  const { state, now, activeBuyerId, activeBuyerApproved, setActiveBuyerId, submitBid, hydrated } = useAuctionStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");

  const activeBuyer = state.buyers.find((buyer) => buyer.id === activeBuyerId) ?? state.buyers[0];
  const featuredAuction = getFeaturedAuction(state);
  const detailAuction = mode === "auction" ? state.auctions.find((auction) => auction.id === auctionId) : undefined;
  const feedItems = state.auctions.filter((auction) => {
    if (filter === "ALL") {
      return true;
    }
    return getAuctionRuntime(auction, now).statusLabel === filter;
  });
  const spotlight = detailAuction ?? featuredAuction;

  if (!hydrated) {
    return <div className="page-shell">Loading buyer workspace...</div>;
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Buyer operations</p>
          <h1>{mode === "feed" ? "A feed built for industrial buyers." : "Auction view with contract-safe bidding."}</h1>
          <p className="lead">
            Polling keeps the feed fresh every few seconds. Bids are disabled until the auction is live and the
            active buyer is approved.
          </p>
          <div className="hero-meta">
            <span className="chip chip-accent">{formatSyncTime(state.lastSyncedAt)}</span>
            <span className="chip">{state.auctions.length} auctions tracked</span>
            <span className="chip">{activeBuyerApproved ? "Buyer approved" : "Buyer pending"}</span>
          </div>
          <div className="hero-meta">
            <Link href="/buyer/orders" className="button button-secondary">
              Pickup queue
            </Link>
            <Link href="/seller" className="button button-secondary">
              Seller hub
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel buyer-switcher">
            <p className="label">Active buyer</p>
            <div className="buyer-list">
              {state.buyers.map((buyer) => (
                <button
                  key={buyer.id}
                  className={`buyer-pill ${buyer.id === activeBuyerId ? "buyer-pill-active" : ""}`}
                  type="button"
                  onClick={() => setActiveBuyerId(buyer.id)}
                >
                  <span>{buyer.name}</span>
                  <small>{buyer.approved ? "approved" : "pending"}</small>
                </button>
              ))}
            </div>
            <p className="muted">{activeBuyer.note}</p>
          </div>
        </div>
      </section>

      <section className="metrics">
        {[
          ["Live", state.auctions.filter((auction) => getAuctionRuntime(auction, now).statusLabel === "LIVE").length],
          [
            "Scheduled",
            state.auctions.filter((auction) => getAuctionRuntime(auction, now).statusLabel === "SCHEDULED").length
          ],
          ["Won", state.auctions.filter((auction) => auction.lot.status === "PICKUP_SCHEDULED").length],
          ["Void", state.auctions.filter((auction) => getAuctionRuntime(auction, now).statusLabel === "VOID").length]
        ].map(([label, value]) => (
          <article key={label as string} className="metric-card">
            <span className="label">{label as string}</span>
            <strong>{value as number}</strong>
          </article>
        ))}
      </section>

      {mode === "feed" ? (
        <section className="feed-layout">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Buyer feed</p>
                <h2>Available lots and auctions</h2>
              </div>
            </div>
            <div className="filter-row">
              {filters.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`filter-chip ${filter === value ? "filter-chip-active" : ""}`}
                  onClick={() => setFilter(value)}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="auction-list">
              {feedItems.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} now={now} />
              ))}
            </div>
          </div>

          <aside className="panel spotlight-panel">
            <p className="eyebrow">Spotlight</p>
            <h2>{featuredAuction.storeName}</h2>
            <p className="muted">{featuredAuction.summary}</p>
            <div className="spotlight-stats">
              <span>
                <strong>{formatSek(featuredAuction.auction.reservePriceSekPerKg)}</strong>
                <small>reserve</small>
              </span>
              <span>
                <strong>{formatDistance(featuredAuction.distanceKm)}</strong>
                <small>away</small>
              </span>
              <span>
                <strong>{featuredAuction.bids.length}</strong>
                <small>bids</small>
              </span>
            </div>
            <Link href={`/buyer/auctions/${featuredAuction.id}`} className="button button-secondary">
              Open live auction
            </Link>
          </aside>
        </section>
      ) : (
        <section className="detail-layout">
          <div className="panel detail-panel">
            {spotlight ? (
              <>
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Auction view</p>
                    <h2>{spotlight.categoryName}</h2>
                  </div>
                  <span className={`status-badge status-${getAuctionRuntime(spotlight, now).statusTone.toLowerCase()}`}>
                    {getAuctionRuntime(spotlight, now).statusLabel}
                  </span>
                </div>

                <p className="lead compact">{spotlight.summary}</p>

                <div className="detail-grid">
                  <div>
                    <span className="label">Store</span>
                    <strong>{spotlight.storeName}</strong>
                  </div>
                  <div>
                    <span className="label">Storage</span>
                    <strong>{spotlight.lot.storageCondition}</strong>
                  </div>
                  <div>
                    <span className="label">Pickup window</span>
                    <strong>{formatTimeWindow(spotlight.lot.pickupWindow.startAt, spotlight.lot.pickupWindow.endAt)}</strong>
                  </div>
                  <div>
                    <span className="label">Estimated weight</span>
                    <strong>{spotlight.lot.estimatedWeightKg} kg</strong>
                  </div>
                </div>

                <div className="timeline">
                  <div>
                    <span className="label">Auction end</span>
                    <strong>{formatCountdown(getAuctionRuntime(spotlight, now).countdownMs)}</strong>
                  </div>
                  <div>
                    <span className="label">Highest bid</span>
                    <strong>
                      {spotlight.auction.highestBid ? formatSek(spotlight.auction.highestBid.priceSekPerKg) : "No bids yet"}
                    </strong>
                  </div>
                  <div>
                    <span className="label">Reserve</span>
                    <strong>{formatSek(spotlight.auction.reservePriceSekPerKg)}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="eyebrow">Not found</p>
                <h2>Auction not found.</h2>
                <p className="muted">Return to the feed and open a live auction.</p>
                <Link href="/buyer/feed" className="button button-secondary">
                  Back to feed
                </Link>
              </div>
            )}
          </div>

          {spotlight ? (
            <div className="detail-sidebar">
              <BidPanel
                auction={spotlight}
                buyer={activeBuyer}
                now={now}
                onSubmit={(price) => submitBid({ auctionId: spotlight.id, priceSekPerKg: price })}
              />

              <div className="panel">
                <p className="eyebrow">Other auctions</p>
                <div className="compact-list">
                  {state.auctions
                    .filter((auction) => auction.id !== spotlight.id)
                    .map((auction) => (
                      <Link key={auction.id} href={`/buyer/auctions/${auction.id}`} className="compact-row">
                        <span>
                          <strong>{auction.categoryName}</strong>
                          <small>{auction.storeName}</small>
                        </span>
                        <span>{getAuctionRuntime(auction, now).statusLabel}</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}

function AuctionCard({ auction, now }: { auction: DemoAuctionRecord; now: number }) {
  const runtime = getAuctionRuntime(auction, now);
  return (
    <article className="auction-card">
      <div className="auction-card-top">
        <div>
          <p className="eyebrow">{auction.categoryName}</p>
          <h3>{auction.storeName}</h3>
        </div>
        <span className={`status-badge status-${runtime.statusTone.toLowerCase()}`}>{runtime.statusLabel}</span>
      </div>

      <p className="muted">{auction.summary}</p>

      <div className="auction-card-grid">
        <div>
          <span className="label">Reserve</span>
          <strong>{formatSek(auction.auction.reservePriceSekPerKg)}</strong>
        </div>
        <div>
          <span className="label">Highest</span>
          <strong>{auction.auction.highestBid ? formatSek(auction.auction.highestBid.priceSekPerKg) : "None"}</strong>
        </div>
        <div>
          <span className="label">Distance</span>
          <strong>{formatDistance(auction.distanceKm)}</strong>
        </div>
        <div>
          <span className="label">Bids</span>
          <strong>{auction.bids.length}</strong>
        </div>
      </div>

      <div className="tag-row">
        {auction.tags.map((tag) => (
          <span key={tag} className="chip chip-muted">
            {tag}
          </span>
        ))}
      </div>

      <Link href={`/buyer/auctions/${auction.id}`} className="button button-secondary">
        Open auction
      </Link>
    </article>
  );
}
