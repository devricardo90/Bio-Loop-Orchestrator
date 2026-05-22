"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuctionStore } from "./auction-store";
import {
  formatDistance,
  formatAuctionStatusLabel,
  formatEnumLabel,
  formatSek,
  formatSyncTime,
  formatTagLabel,
  formatTimeWindow,
  getAuctionRuntime
} from "../lib/demo-auctions";
import {
  formatSellerRevenue,
  formatSellerStatusLine,
  getSellerOutcomeLabel,
  getSellerRecords,
  getSellerSpotlight,
  getSellerSummary,
  getSellerTimeline,
  getSellerTone
} from "../lib/seller-view";
import { WorkspaceState } from "./workspace-state";

type SellerDashboardProps = {
  mode: "lots" | "results";
  lotId?: string;
};

const lotFilters = ["ALL", "LIVE", "AWARDED", "PICKUP", "VOID"] as const;
const resultFilters = ["ALL", "SETTLED", "AWARDED", "VOID"] as const;

export function SellerDashboard({ mode, lotId }: SellerDashboardProps) {
  const { state, now, hydrated } = useAuctionStore();
  const [filter, setFilter] = useState<(typeof lotFilters)[number] | (typeof resultFilters)[number]>(
    mode === "results" ? "ALL" : "ALL"
  );

  const records = useMemo(() => getSellerRecords(state), [state]);
  const summary = useMemo(() => getSellerSummary(records), [records]);
  const spotlight = useMemo(() => getSellerSpotlight(records, lotId, mode), [lotId, mode, records]);

  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      if (filter === "ALL") {
        return true;
      }

      if (filter === "LIVE") {
        return record.auction.status === "LIVE";
      }

      if (filter === "AWARDED") {
        return record.lot.status === "AWARDED" || record.lot.status === "PICKUP_SCHEDULED" || record.lot.status === "PICKED_UP";
      }

      if (filter === "PICKUP") {
        return record.lot.status === "PICKUP_SCHEDULED" || record.lot.status === "PICKED_UP";
      }

      if (filter === "SETTLED") {
        return record.lot.status === "COMPLETED" || record.lot.status === "PICKED_UP";
      }

      if (filter === "VOID") {
        return record.auction.status === "VOID" || record.lot.status === "EXPIRED" || record.lot.status === "CANCELLED";
      }

      return true;
    });
  }, [filter, records]);

  if (!hydrated) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Seller operations"
          title="Loading seller overview."
          description="The seller lots and results surfaces are loading from the current runtime."
          tone="loading"
        />
      </main>
    );
  }

  const filters = mode === "results" ? resultFilters : lotFilters;

  return (
    <main className="app-shell seller-shell">
      <section className="hero">
        <div className="hero-copy seller-hero-copy">
          <p className="eyebrow">Seller operations</p>
          <h1>{mode === "lots" ? "Manage active lots and auction lifecycle." : "Review outcomes and settlement states."}</h1>
          <p className="lead">
            The seller surface mirrors the trade pipeline with live statuses, compact timelines, and result cards
            that stay aligned with the operating rules.
          </p>
          <div className="journey-banner seller-journey-banner">
            <div className="journey-banner-copy">
              <span className="journey-badge">Second product readout</span>
              <strong>{mode === "lots" ? "Lots -> outcomes -> reports" : "Results explain how the seller closes value"}</strong>
              <p>
                {mode === "lots"
                  ? "Use this workspace after buyer to show how the same runtime supports listed lots, live control, and operational follow-through."
                  : "This results view should feel like the seller-side confirmation of what the buyer flow started."}
              </p>
            </div>
            <div className="journey-banner-steps">
              <span className={`journey-step ${mode === "lots" ? "journey-step-active" : ""}`}>1. Lots</span>
              <span className={`journey-step ${mode === "results" ? "journey-step-active" : ""}`}>2. Results</span>
              <span className="journey-step">3. Reports</span>
            </div>
          </div>
          <div className="hero-meta">
            <span className="chip chip-accent">{formatSyncTime(state.lastSyncedAt)}</span>
            <span className="chip">{summary.live} live</span>
            <span className="chip">{summary.settled} settled</span>
            <span className="chip">{summary.voided} voided</span>
          </div>
          <div className="hero-meta">
            <Link href="/seller/lots" className="button button-primary">
              Seller lots
            </Link>
            <Link href="/seller/results" className="button button-secondary">
              Seller results
            </Link>
            <Link href="/seller/reports" className="button button-secondary">
              Seller reports
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel seller-summary-panel">
            <p className="label">Portfolio snapshot</p>
            <div className="metrics seller-metrics">
              {[
                ["Listed", summary.listed],
                ["Live", summary.live],
                ["Awarded", summary.awarded],
                ["Settled", summary.settled]
              ].map(([label, value]) => (
                <article key={label as string} className="metric-card">
                  <span className="label">{label as string}</span>
                  <strong>{value as number}</strong>
                </article>
              ))}
            </div>
            <div className="seller-revenue-block">
              <span className="label">Projected settled value</span>
              <strong>{formatSek(summary.projectedRevenue)}</strong>
            </div>
          </div>
        </div>
      </section>
      {mode === "lots" ? (
        <section className="buyer-context-strip" aria-label="Seller overview context">
          <article className="panel context-card">
            <p className="eyebrow">Why seller comes second</p>
            <h2>Seller explains control, outcomes, and operational proof.</h2>
            <p className="muted">
              Once buyer proves discovery and bidding, seller shows how the same flow becomes listed inventory,
              outcome visibility, and exportable evidence.
            </p>
          </article>
          <article className="panel context-card">
            <p className="eyebrow">What to verify</p>
            <ul className="feature-list">
              <li>Show listed lots before diving into result states</li>
              <li>Use spotlight and timeline to explain where the lot sits now</li>
              <li>Keep reports as the proof layer, not the first thing on screen</li>
            </ul>
          </article>
        </section>
      ) : null}

      <section className="seller-layout">
        <div className="panel seller-list-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">{mode === "lots" ? "Seller lots" : "Seller results"}</p>
              <h2>{mode === "lots" ? "All listed lots and auctions" : "Outcome cards for settled or terminal lots"}</h2>
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

          <div className="seller-list">
            {visibleRecords.length > 0 ? (
              visibleRecords.map((record) => <SellerRecordCard key={record.id} record={record} mode={mode} now={now} />)
            ) : (
              <div className="empty-state">
                <p className="eyebrow">No records</p>
                <h2>No seller lots matched the current filter.</h2>
                <p className="muted">Switch the filter or check the auction feed after the next sync.</p>
              </div>
            )}
          </div>
        </div>

        {spotlight ? (
          <aside className="panel seller-spotlight">
            <p className="eyebrow">Spotlight</p>
            <h2>{spotlight.categoryName}</h2>
            <p className="muted">{spotlight.summary}</p>

            <div className="spotlight-stats">
              <span>
                <strong>{formatSek(spotlight.auction.reservePriceSekPerKg)}</strong>
                <small>reserve</small>
              </span>
              <span>
                <strong>{formatDistance(spotlight.distanceKm)}</strong>
                <small>away</small>
              </span>
              <span>
                <strong>{spotlight.bids.length}</strong>
                <small>bids</small>
              </span>
            </div>

            <div className="seller-outcome-card">
              <span className={`status-badge status-${getSellerTone(spotlight)}`}>{getSellerOutcomeLabel(spotlight)}</span>
              <strong>{formatSellerRevenue(spotlight)}</strong>
              <p className="muted">{formatSellerStatusLine(spotlight)}</p>
            </div>

            <div className="status-timeline">
              {getSellerTimeline(spotlight).map((step) => (
                <div key={step.key} className={`timeline-step timeline-step-${step.state}`}>
                  <span className={`timeline-step-marker timeline-step-marker-${step.tone}`} />
                  <div>
                    <strong>{step.label}</strong>
                    <p className="muted">
                      {step.state === "current"
                        ? "Current stage"
                        : step.state === "complete"
                          ? "Completed stage"
                          : "Upcoming stage"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="seller-detail-grid">
              <div>
                <span className="label">Pickup window</span>
                <strong>{formatTimeWindow(spotlight.lot.pickupWindow.startAt, spotlight.lot.pickupWindow.endAt)}</strong>
              </div>
              <div>
                <span className="label">Weight</span>
                <strong>{spotlight.lot.estimatedWeightKg} kg</strong>
              </div>
              <div>
                <span className="label">Auction</span>
                <strong>{formatAuctionStatusLabel(getAuctionRuntime(spotlight, now).statusLabel)}</strong>
              </div>
              <div>
                <span className="label">Status</span>
                <strong>{formatEnumLabel(spotlight.lot.status)}</strong>
              </div>
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}

function SellerRecordCard({
  record,
  mode,
  now
}: {
  record: ReturnType<typeof getSellerRecords>[number];
  mode: "lots" | "results";
  now: number;
}) {
  const runtime = getAuctionRuntime(record, now);

  return (
    <article className="seller-card seller-record-card">
      <div className="seller-card-top seller-record-head">
        <div>
          <p className="eyebrow">{record.categoryName}</p>
          <h3>{record.storeName}</h3>
          <p className="muted seller-record-id">{record.id}</p>
        </div>
        <span className={`status-badge status-${getSellerTone(record)}`}>{formatEnumLabel(record.lot.status)}</span>
      </div>

      <div className="seller-record-summary">
        <div>
          <span className="label">Seller outcome</span>
          <strong>{getSellerOutcomeLabel(record)}</strong>
          <p className="muted">{formatSellerStatusLine(record)}</p>
        </div>
        <div className="seller-record-value">
          <span className="label">Projected value</span>
          <strong>{formatSellerRevenue(record)}</strong>
        </div>
      </div>

      <p className="muted seller-record-copy">{record.summary}</p>

      <div className="seller-card-grid">
        <div>
          <span className="label">Auction</span>
          <strong>{formatAuctionStatusLabel(runtime.statusLabel)}</strong>
        </div>
        <div>
          <span className="label">Highest bid</span>
          <strong>{record.auction.highestBid ? formatSek(record.auction.highestBid.priceSekPerKg) : "None"}</strong>
        </div>
        <div>
          <span className="label">Reserve</span>
          <strong>{formatSek(record.auction.reservePriceSekPerKg)}</strong>
        </div>
        <div>
          <span className="label">Lifecycle</span>
          <strong>{formatEnumLabel(record.lot.status)}</strong>
        </div>
      </div>

      <div className="seller-card-grid">
        <div>
          <span className="label">Pickup window</span>
          <strong>{formatTimeWindow(record.lot.pickupWindow.startAt, record.lot.pickupWindow.endAt)}</strong>
        </div>
        <div>
          <span className="label">Weight</span>
          <strong>{record.lot.estimatedWeightKg} kg</strong>
        </div>
        <div>
          <span className="label">Distance</span>
          <strong>{formatDistance(record.distanceKm)}</strong>
        </div>
        <div>
          <span className="label">Bids</span>
          <strong>{record.bids.length}</strong>
        </div>
      </div>

      <div className="seller-card-actions">
        <div className="tag-row seller-record-tags">
          {record.tags.map((tag) => (
            <span key={tag} className="chip chip-muted">
              {formatTagLabel(tag)}
            </span>
          ))}
        </div>

        <Link href={`/seller/lots/${record.id}`} className="button button-secondary seller-record-cta">
          {mode === "lots" ? "Open lot detail" : "Open outcome detail"}
        </Link>
      </div>
    </article>
  );
}
