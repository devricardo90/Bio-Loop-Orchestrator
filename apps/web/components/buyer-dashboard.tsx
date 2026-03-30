"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { submitBidToApi } from "../lib/bid-api";
import { fetchBuyerAuctionDetail, fetchBuyerFeed, type BuyerBidSubmitResult } from "../lib/buyer-api";
import {
  formatCountdown,
  formatSek,
  formatSyncTime,
  formatTimeWindow,
  getAuctionRuntime,
  getFeaturedAuction,
  type DemoAuctionRecord,
  type DemoBuyer
} from "../lib/demo-auctions";
import { BidPanel } from "./bid-panel";
import { ApiReferencePanel } from "./api-reference-panel";
import { WorkspaceState } from "./workspace-state";

type BuyerDashboardProps = {
  mode: "feed" | "auction";
  auctionId?: string;
};

type BuyerWorkspaceState = {
  buyers: DemoBuyer[];
  activeBuyerId: string;
  auctions: DemoAuctionRecord[];
  lastSyncedAt: string;
};

const filters = ["ALL", "LIVE", "SCHEDULED", "ENDED", "VOID"] as const;

export function BuyerDashboard({ mode, auctionId }: BuyerDashboardProps) {
  const [workspace, setWorkspace] = useState<BuyerWorkspaceState | null>(null);
  const [activeBuyerId, setActiveBuyerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const now = Date.now();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        if (mode === "auction" && auctionId) {
          const result = await fetchBuyerAuctionDetail(auctionId);
          if (cancelled) {
            return;
          }

          setWorkspace({
            buyers: result.buyers,
            activeBuyerId: result.activeBuyerId,
            auctions: [result.auction, ...result.relatedAuctions],
            lastSyncedAt: result.lastSyncedAt
          });
          setActiveBuyerId((current) => current || result.activeBuyerId);
        } else {
          const result = await fetchBuyerFeed();
          if (cancelled) {
            return;
          }

          setWorkspace({
            buyers: result.buyers,
            activeBuyerId: result.activeBuyerId,
            auctions: result.auctions,
            lastSyncedAt: result.lastSyncedAt
          });
          setActiveBuyerId((current) => current || result.activeBuyerId);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load buyer workspace.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [auctionId, mode]);

  useEffect(() => {
    if (!workspace) {
      return;
    }

    const stillExists = workspace.buyers.some((buyer) => buyer.id === activeBuyerId);
    if (!stillExists) {
      setActiveBuyerId(workspace.activeBuyerId);
    }
  }, [activeBuyerId, workspace]);

  const activeBuyer = workspace?.buyers.find((buyer) => buyer.id === activeBuyerId) ?? workspace?.buyers[0];
  const featuredAuction = useMemo(() => {
    if (!workspace || workspace.auctions.length === 0) {
      return null;
    }

    return getFeaturedAuction({
      buyers: workspace.buyers,
      activeBuyerId,
      auctions: workspace.auctions,
      lastSyncedAt: workspace.lastSyncedAt
    });
  }, [activeBuyerId, workspace]);
  const detailAuction = mode === "auction" ? workspace?.auctions.find((auction) => auction.id === auctionId) : undefined;
  const feedItems =
    workspace?.auctions.filter((auction) => {
      if (filter === "ALL") {
        return true;
      }

      return getAuctionRuntime(auction, now).statusLabel === filter;
    }) ?? [];
  const spotlight = detailAuction ?? featuredAuction;
  const activeBuyerApproved = Boolean(activeBuyer?.approved);

  async function reloadWorkspace() {
    if (mode === "auction" && auctionId) {
      const result = await fetchBuyerAuctionDetail(auctionId);
      setWorkspace({
        buyers: result.buyers,
        activeBuyerId: result.activeBuyerId,
        auctions: [result.auction, ...result.relatedAuctions],
        lastSyncedAt: result.lastSyncedAt
      });
      return;
    }

    const result = await fetchBuyerFeed();
    setWorkspace({
      buyers: result.buyers,
      activeBuyerId: result.activeBuyerId,
      auctions: result.auctions,
      lastSyncedAt: result.lastSyncedAt
    });
  }

  async function submitBid(priceSekPerKg: number): Promise<BuyerBidSubmitResult> {
    if (!activeBuyer || !spotlight) {
      return { ok: false, error: "Buyer workspace is not ready." };
    }

    try {
      const response = await submitBidToApi({
        auctionId: spotlight.id,
        buyerId: activeBuyer.id,
        priceSekPerKg
      });

      await reloadWorkspace();
      return { ok: true, bid: response.bid, source: "api" };
    } catch (nextError) {
      return {
        ok: false,
        error: nextError instanceof Error ? nextError.message : "Unable to submit bid."
      };
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Buyer API"
          title="Loading buyer workspace."
          description="The live buyer feed and auction detail are loading from the API."
          tone="loading"
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Buyer API"
          title="Unable to load the buyer workspace."
          description={error}
          tone="error"
          primaryAction={{ label: "Back to login", href: "/login" }}
          secondaryAction={{ label: "Retry", onClick: () => void reloadWorkspace() }}
        />
      </main>
    );
  }

  if (!workspace || !activeBuyer || !spotlight) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Buyer workspace"
          title="No buyer data available."
          description="The live API returned no buyer workspace records for the current session."
          tone="empty"
          primaryAction={{ label: "Back to login", href: "/login" }}
          secondaryAction={{ label: "Reload workspace", onClick: () => void reloadWorkspace() }}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Buyer operations</p>
          <h1>{mode === "feed" ? "A feed built for industrial buyers." : "Auction view with contract-safe bidding."}</h1>
          <p className="lead">
            The buyer feed and auction detail are loaded from the live API. Bids stay disabled until the auction is
            live and the active buyer is approved.
          </p>
          <div className="journey-banner">
            <div className="journey-banner-copy">
              <span className="journey-badge">Primary product proof</span>
              <strong>{mode === "feed" ? "Feed -> live auction -> pickup" : "Auction detail inside the buyer path"}</strong>
              <p>
                {mode === "feed"
                  ? "Use this workspace first in the demo. It shows where buyers discover lots, verify source=api, and continue into pickup."
                  : "This detail view is where the buyer path proves contract-safe bidding without leaving the validated runtime."}
              </p>
            </div>
            <div className="journey-banner-steps">
              <span className="journey-step journey-step-active">1. Feed</span>
              <span className={`journey-step ${mode === "auction" ? "journey-step-active" : ""}`}>2. Auction</span>
              <span className="journey-step">3. Pickup</span>
            </div>
          </div>
          <div className="hero-meta">
            <span className="chip chip-accent">{formatSyncTime(workspace.lastSyncedAt)}</span>
            <span className="chip">{workspace.auctions.length} auctions tracked</span>
            <span className="chip">{activeBuyerApproved ? "Buyer approved" : "Buyer pending"}</span>
            <span className="chip">source=api</span>
          </div>
          <div className="hero-meta">
            <Link href="/buyer/orders" className="button button-secondary">
              Pickup queue
            </Link>
            <Link href="/buyer/feed" className="button button-secondary">
              Buyer feed
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel buyer-switcher">
            <p className="label">Active buyer</p>
            <div className="buyer-list">
              {workspace.buyers.map((buyer) => (
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
          ["Live", workspace.auctions.filter((auction) => getAuctionRuntime(auction, now).statusLabel === "LIVE").length],
          [
            "Scheduled",
            workspace.auctions.filter((auction) => getAuctionRuntime(auction, now).statusLabel === "SCHEDULED").length
          ],
          ["Won", workspace.auctions.filter((auction) => auction.lot.status === "PICKUP_SCHEDULED").length],
          ["Void", workspace.auctions.filter((auction) => getAuctionRuntime(auction, now).statusLabel === "VOID").length]
        ].map(([label, value]) => (
          <article key={label as string} className="metric-card">
            <span className="label">{label as string}</span>
            <strong>{value as number}</strong>
          </article>
        ))}
      </section>
      {mode === "feed" ? (
        <section className="buyer-context-strip" aria-label="Buyer feed context">
          <article className="panel context-card">
            <p className="eyebrow">Why this comes first</p>
            <h2>Buyer is the clearest proof of product continuity.</h2>
            <p className="muted">
              The feed explains discovery, the auction explains price action, and pickup explains operational closure
              without changing workspace.
            </p>
          </article>
          <article className="panel context-card">
            <p className="eyebrow">What to verify</p>
            <ul className="feature-list">
              <li>Confirm `source=api` before discussing the rest of the demo</li>
              <li>Open a live auction from the spotlight or feed list</li>
              <li>Use pickup queue as the operational continuation after award</li>
            </ul>
          </article>
        </section>
      ) : null}

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
            <h2>{featuredAuction?.storeName}</h2>
            <p className="muted">{featuredAuction?.summary}</p>
            <div className="spotlight-stats">
              <span>
                <strong>{featuredAuction ? formatSek(featuredAuction.auction.reservePriceSekPerKg) : "N/A"}</strong>
                <small>reserve</small>
              </span>
              <span>
                <strong>{featuredAuction ? `${featuredAuction.distanceKm.toFixed(1)} km` : "N/A"}</strong>
                <small>from Stockholm</small>
              </span>
              <span>
                <strong>{featuredAuction?.bids.length ?? 0}</strong>
                <small>bids</small>
              </span>
            </div>
            {featuredAuction ? (
              <Link href={`/buyer/auctions/${featuredAuction.id}`} className="button button-secondary">
                Open live auction
              </Link>
            ) : null}
          </aside>

          <ApiReferencePanel
            workspace="buyer"
            title="Trace buyer API behavior"
            description="Use the live API reference to inspect the feed, auction detail, and bid contract while validating buyer operations."
          />
        </section>
      ) : (
        <section className="detail-layout">
          <div className="panel detail-panel">
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
                <strong>{spotlight.auction.highestBid ? formatSek(spotlight.auction.highestBid.priceSekPerKg) : "No bids yet"}</strong>
              </div>
              <div>
                <span className="label">Reserve</span>
                <strong>{formatSek(spotlight.auction.reservePriceSekPerKg)}</strong>
              </div>
            </div>
          </div>

          <div className="detail-sidebar">
            <BidPanel auction={spotlight} buyer={activeBuyer} now={now} onSubmit={submitBid} />

            <div className="panel">
              <p className="eyebrow">Other auctions</p>
              <div className="compact-list">
                {workspace.auctions
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

            <ApiReferencePanel
              workspace="buyer"
              title="Cross-check the auction contract"
              description="Open the API reference when you need to verify bid validation, payload shapes, or the live buyer read-model."
            />
          </div>
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
          <strong>{auction.distanceKm.toFixed(1)} km</strong>
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
