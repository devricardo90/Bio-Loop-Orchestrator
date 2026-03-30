"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { fetchBuyerFeed } from "../lib/buyer-api";
import { formatSyncTime, formatTimeWindow, type DemoAuctionRecord, type DemoBuyer } from "../lib/demo-auctions";
import { schedulePickupToApi, submitPodToApi } from "../lib/pickup-api";
import {
  formatPickupRevenue,
  getPickupOrders,
  getPickupSpotlight,
  getPickupStatusLabel,
  getPickupStatusLine,
  getPickupSummary,
  getPickupTimeline,
  getPickupTone,
  getPickupWindow,
  type PickupOrderRecord
} from "../lib/pickup-view";
import { ApiReferencePanel } from "./api-reference-panel";
import { WorkspaceState } from "./workspace-state";

type PickupDashboardProps = {
  mode: "list" | "detail";
  orderId?: string;
};

type PickupWorkspaceState = {
  buyers: DemoBuyer[];
  activeBuyerId: string;
  auctions: DemoAuctionRecord[];
  lastSyncedAt: string;
};

const proofTypes = ["PHOTO", "SIGNATURE", "DOC"] as const;

export function PickupDashboard({ mode, orderId }: PickupDashboardProps) {
  const [workspace, setWorkspace] = useState<PickupWorkspaceState | null>(null);
  const [activeBuyerId, setActiveBuyerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [podType, setPodType] = useState<(typeof proofTypes)[number]>("PHOTO");
  const [podUrl, setPodUrl] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [podMessage, setPodMessage] = useState("");
  const [schedulePending, startScheduleTransition] = useTransition();
  const [podPending, startPodTransition] = useTransition();
  const now = Date.now();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchBuyerFeed();
        if (cancelled) {
          return;
        }

        const routeOrderBuyerId = orderId
          ? result.auctions.find((auction) => auction.order?.id === orderId)?.order?.buyerId ?? result.activeBuyerId
          : result.activeBuyerId;

        setWorkspace({
          buyers: result.buyers,
          activeBuyerId: result.activeBuyerId,
          auctions: result.auctions,
          lastSyncedAt: result.lastSyncedAt
        });
        setActiveBuyerId((current) => current || routeOrderBuyerId);
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load pickup workspace.");
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
  }, [orderId]);

  const activeBuyer = workspace?.buyers.find((buyer) => buyer.id === activeBuyerId) ?? workspace?.buyers[0];
  const orders = useMemo(() => {
    if (!workspace) {
      return [];
    }

    return getPickupOrders(workspace, activeBuyerId);
  }, [activeBuyerId, workspace]);
  const summary = useMemo(() => getPickupSummary(orders), [orders]);
  const spotlight = useMemo(() => {
    if (!workspace) {
      return null;
    }

    return getPickupSpotlight(orders, orderId, mode);
  }, [mode, orderId, orders, workspace]);

  useEffect(() => {
    if (!workspace) {
      return;
    }

    const stillExists = workspace.buyers.some((buyer) => buyer.id === activeBuyerId);
    if (!stillExists) {
      setActiveBuyerId(workspace.activeBuyerId);
    }
  }, [activeBuyerId, workspace]);

  useEffect(() => {
    if (!spotlight) {
      return;
    }

    const pickupWindow = getPickupWindow(spotlight);
    setScheduleStart(toLocalDateTime(pickupWindow.startAt));
    setScheduleEnd(toLocalDateTime(pickupWindow.endAt));
    setPodType("PHOTO");
    setPodUrl(`https://proofs.example.com/${spotlight.order.id}`);
    setScheduleMessage("");
    setPodMessage("");
  }, [spotlight?.order.id]);

  async function reloadWorkspace() {
    const result = await fetchBuyerFeed();
    const routeOrderBuyerId = orderId
      ? result.auctions.find((auction) => auction.order?.id === orderId)?.order?.buyerId ?? result.activeBuyerId
      : result.activeBuyerId;
    setWorkspace({
      buyers: result.buyers,
      activeBuyerId: result.activeBuyerId,
      auctions: result.auctions,
      lastSyncedAt: result.lastSyncedAt
    });
    setActiveBuyerId(routeOrderBuyerId);
  }

  if (loading) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Pickup API"
          title="Loading pickup workspace."
          description="The buyer pickup queue and order detail are loading from the live API."
          tone="loading"
          statusLabel="Pickup sync"
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Pickup API"
          title="Unable to load the pickup workspace."
          description={error}
          tone="error"
          statusLabel="Pickup API error"
          primaryAction={{ label: "Buyer feed", href: "/buyer/feed" }}
          secondaryAction={{ label: "Retry", onClick: () => void reloadWorkspace() }}
        />
      </main>
    );
  }

  if (!workspace || !activeBuyer) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Pickup workspace"
          title="No pickup data available."
          description="The live buyer API returned no pickup-ready orders for the current workspace."
          tone="empty"
          statusLabel="No pickup orders"
          primaryAction={{ label: "Buyer feed", href: "/buyer/feed" }}
          secondaryAction={{ label: "Reload workspace", onClick: () => void reloadWorkspace() }}
        />
      </main>
    );
  }

  const activeBuyerApproved = activeBuyer.approved;
  const activeBuyerName = activeBuyer.name;
  const canSchedule = Boolean(spotlight && isScheduleAllowed(spotlight));
  const canSubmitPod = Boolean(spotlight && isPodAllowed(spotlight));
  const scheduleWindowValid = isScheduleWindowValid(scheduleStart, scheduleEnd);
  const scheduleDisabled = !spotlight || !canSchedule || !scheduleWindowValid || schedulePending;
  const podDisabled = !spotlight || !canSubmitPod || !podUrl.trim() || podPending;

  return (
    <main className="app-shell pickup-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Pickup operations</p>
          <h1>{mode === "list" ? "Schedule pickups and keep PODs moving." : "Pickup detail with proof upload and dispute state."}</h1>
          <p className="lead">
            The pickup desk now runs on the buyer API read-model, with explicit status guards and no silent demo
            fallback in the main path.
          </p>
          <div className="hero-meta">
            <span className="chip chip-accent">{formatSyncTime(workspace.lastSyncedAt)}</span>
            <span className="chip">{summary.scheduled} scheduled</span>
            <span className="chip">{summary.completed} completed</span>
            <span className="chip">{summary.disputed} disputed</span>
            <span className="chip">source=api</span>
          </div>
          <div className="hero-meta">
            <Link href="/buyer/feed" className="button button-secondary">
              Buyer feed
            </Link>
            <Link href="/buyer/orders" className="button button-secondary">
              Pickup queue
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
            <p className="muted">
              {activeBuyerName} is {activeBuyerApproved ? "approved" : "pending approval"} for pickup actions.
            </p>
          </div>
        </div>
      </section>

      <section className="metrics">
        {[
          ["Pending", summary.pending],
          ["Scheduled", summary.scheduled],
          ["Completed", summary.completed],
          ["No-show", summary.noShow]
        ].map(([label, value]) => (
          <article key={label as string} className="metric-card">
            <span className="label">{label as string}</span>
            <strong>{value as number}</strong>
          </article>
        ))}
      </section>

      {mode === "list" ? (
        <section className="pickup-layout">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Pickup queue</p>
                <h2>Orders ready for scheduling and POD</h2>
              </div>
            </div>

            <div className="pickup-list">
              {orders.length > 0 ? (
                orders.map((record) => <PickupOrderCard key={record.order.id} record={record} now={now} />)
              ) : (
                <WorkspaceState
                  eyebrow="No orders"
                  title="No pickup orders for the active buyer."
                  description="Switch buyer profiles or return to the buyer feed to open a different runtime path."
                  tone="empty"
                  statusLabel="Queue empty"
                  primaryAction={{ label: "Back to feed", href: "/buyer/feed" }}
                />
              )}
            </div>
          </div>

          <aside className="panel spotlight-panel">
            <p className="eyebrow">Pickup status</p>
            <h2>{spotlight ? spotlight.categoryName : "No active pickup"}</h2>
            <p className="muted">{spotlight ? getPickupStatusLine(spotlight, now) : "Open an order to schedule pickup."}</p>

            {spotlight ? (
              <>
                <div className="spotlight-stats">
                  <span>
                    <strong>{getPickupStatusLabel(spotlight)}</strong>
                    <small>current state</small>
                  </span>
                  <span>
                    <strong>{formatPickupRevenue(spotlight)}</strong>
                    <small>order value</small>
                  </span>
                  <span>
                    <strong>{formatTimeWindow(getPickupWindow(spotlight).startAt, getPickupWindow(spotlight).endAt)}</strong>
                    <small>window</small>
                  </span>
                </div>
                <Link href={`/buyer/orders/${spotlight.order.id}`} className="button button-secondary">
                  Open order detail
                </Link>
              </>
            ) : null}
          </aside>

          <ApiReferencePanel
            workspace="pickup"
            title="Trace pickup API behavior"
            description="Use the live API reference to inspect the scheduling and POD endpoints while validating buyer pickup operations."
          />
        </section>
      ) : (
        <section className="pickup-layout">
          <div className="panel detail-panel">
            {spotlight ? (
              <>
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Order detail</p>
                    <h2>{spotlight.categoryName}</h2>
                  </div>
                  <span className={`status-badge status-${getPickupTone(spotlight)}`}>{getPickupStatusLabel(spotlight)}</span>
                </div>

                <p className="lead compact">{spotlight.summary}</p>

                <div className="detail-grid">
                  <div>
                    <span className="label">Store</span>
                    <strong>{spotlight.storeName}</strong>
                  </div>
                  <div>
                    <span className="label">Pickup window</span>
                    <strong>{formatTimeWindow(getPickupWindow(spotlight).startAt, getPickupWindow(spotlight).endAt)}</strong>
                  </div>
                  <div>
                    <span className="label">Order status</span>
                    <strong>{spotlight.order.status}</strong>
                  </div>
                  <div>
                    <span className="label">Pickup status</span>
                    <strong>{spotlight.order.pickupStatus}</strong>
                  </div>
                </div>

                <div className="pickup-action-grid">
                  <form
                    className="pickup-action-card"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleSchedule({
                        order: spotlight,
                        scheduleStart,
                        scheduleEnd,
                        setScheduleMessage,
                        startScheduleTransition,
                        reloadWorkspace
                      });
                    }}
                  >
                    <div className="panel-head compact-row">
                      <div>
                        <p className="eyebrow">Schedule pickup</p>
                        <h3>Pick a future window</h3>
                      </div>
                      <span className={`status-badge status-${canSchedule ? "scheduled" : "void"}`}>
                        {canSchedule ? "Allowed" : "Locked"}
                      </span>
                    </div>

                    <label className="field">
                      <span>Start</span>
                      <input
                        className="input"
                        type="datetime-local"
                        value={scheduleStart}
                        onChange={(event) => setScheduleStart(event.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>End</span>
                      <input
                        className="input"
                        type="datetime-local"
                        value={scheduleEnd}
                        onChange={(event) => setScheduleEnd(event.target.value)}
                      />
                    </label>

                    <button className="button button-primary" type="submit" disabled={scheduleDisabled}>
                      {schedulePending ? "Scheduling..." : "Schedule pickup"}
                    </button>
                    <p className={`message ${scheduleMessage ? "message-visible" : ""}`} aria-live="polite">
                      {scheduleMessage ||
                        (canSchedule
                          ? scheduleWindowValid
                            ? "The pickup window will be sent directly to the live API."
                            : "The window must be in the future and end after the start."
                          : "This order cannot be rescheduled in its current state.")}
                    </p>
                  </form>

                  <form
                    className="pickup-action-card"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handlePod({
                        order: spotlight,
                        podType,
                        podUrl,
                        setPodMessage,
                        startPodTransition,
                        reloadWorkspace
                      });
                    }}
                  >
                    <div className="panel-head compact-row">
                      <div>
                        <p className="eyebrow">Upload POD</p>
                        <h3>Record proof of delivery or pickup</h3>
                      </div>
                      <span className={`status-badge status-${canSubmitPod ? "live" : "void"}`}>
                        {canSubmitPod ? "Allowed" : "Locked"}
                      </span>
                    </div>

                    <label className="field">
                      <span>Proof type</span>
                      <select className="input" value={podType} onChange={(event) => setPodType(event.target.value as (typeof proofTypes)[number])}>
                        {proofTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Proof URL</span>
                      <input
                        className="input"
                        type="url"
                        value={podUrl}
                        onChange={(event) => setPodUrl(event.target.value)}
                        placeholder="https://storage.example.com/proof.jpg"
                      />
                    </label>

                    <button className="button button-primary" type="submit" disabled={podDisabled}>
                      {podPending ? "Uploading..." : "Submit POD"}
                    </button>
                    <p className={`message ${podMessage ? "message-visible" : ""}`} aria-live="polite">
                      {podMessage ||
                        (canSubmitPod
                          ? "Submitting POD will send proof data to the live API."
                          : "POD is only available after pickup has been scheduled.")}
                    </p>
                  </form>
                </div>
              </>
            ) : (
              <WorkspaceState
                eyebrow="Not found"
                title="Pickup order not found."
                description="Return to the pickup queue and open an active order from the live buyer workspace."
                tone="empty"
                statusLabel="Order unavailable"
                primaryAction={{ label: "Back to pickup queue", href: "/buyer/orders" }}
              />
            )}
          </div>

          {spotlight ? (
            <aside className="panel detail-sidebar">
              <p className="eyebrow">Pickup timeline</p>
              <div className="status-timeline">
                {getPickupTimeline(spotlight).map((step) => (
                  <div key={step.key} className={`timeline-step timeline-step-${step.state}`}>
                    <span className="timeline-step-marker" />
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

              <div className="seller-outcome-card">
                <span className={`status-badge status-${getPickupTone(spotlight)}`}>{getPickupStatusLabel(spotlight)}</span>
                <strong>{formatPickupRevenue(spotlight)}</strong>
                <p className="muted">{getPickupStatusLine(spotlight, now)}</p>
              </div>

              <div className="seller-detail-grid">
                <div>
                  <span className="label">Active buyer</span>
                  <strong>{activeBuyerName}</strong>
                </div>
                <div>
                  <span className="label">Auction status</span>
                  <strong>{spotlight.auction.status}</strong>
                </div>
                <div>
                  <span className="label">Order id</span>
                  <strong>{spotlight.order.id}</strong>
                </div>
                <div>
                  <span className="label">Pickup status</span>
                  <strong>{spotlight.order.pickupStatus}</strong>
                </div>
              </div>
            </aside>
          ) : null}

          <ApiReferencePanel
            workspace="pickup"
            title="Verify pickup mutations"
            description="Open the API reference to confirm the schedule-pickup and POD contracts when troubleshooting state transitions."
          />
        </section>
      )}
    </main>
  );
}

function PickupOrderCard({ record, now }: { record: PickupOrderRecord; now: number }) {
  return (
    <article className="seller-card">
      <div className="seller-card-top">
        <div>
          <p className="eyebrow">{record.categoryName}</p>
          <h3>{record.storeName}</h3>
        </div>
        <span className={`status-badge status-${getPickupTone(record)}`}>{getPickupStatusLabel(record)}</span>
      </div>

      <p className="muted">{getPickupStatusLine(record, now)}</p>

      <div className="seller-card-grid">
        <div>
          <span className="label">Window</span>
          <strong>{formatTimeWindow(getPickupWindow(record).startAt, getPickupWindow(record).endAt)}</strong>
        </div>
        <div>
          <span className="label">Status</span>
          <strong>{record.order.status}</strong>
        </div>
        <div>
          <span className="label">Pickup</span>
          <strong>{record.order.pickupStatus}</strong>
        </div>
        <div>
          <span className="label">Value</span>
          <strong>{formatPickupRevenue(record)}</strong>
        </div>
      </div>

      <div className="tag-row">
        {record.tags.map((tag) => (
          <span key={tag} className="chip chip-muted">
            {tag}
          </span>
        ))}
      </div>

      <Link href={`/buyer/orders/${record.order.id}`} className="button button-secondary">
        Open pickup detail
      </Link>
    </article>
  );
}

async function handleSchedule({
  order,
  scheduleStart,
  scheduleEnd,
  setScheduleMessage,
  startScheduleTransition,
  reloadWorkspace
}: {
  order: PickupOrderRecord;
  scheduleStart: string;
  scheduleEnd: string;
  setScheduleMessage: (value: string) => void;
  startScheduleTransition: (callback: () => void) => void;
  reloadWorkspace: () => Promise<void>;
}) {
  if (!isScheduleWindowValid(scheduleStart, scheduleEnd)) {
    setScheduleMessage("The pickup window must be in the future and end after the start.");
    return;
  }

  startScheduleTransition(() => {
    void schedulePickupToApi({
      orderId: order.order.id,
      pickupWindow: {
        startAt: toIsoString(scheduleStart),
        endAt: toIsoString(scheduleEnd)
      }
    })
      .then(async () => {
        await reloadWorkspace();
        setScheduleMessage("Pickup scheduled by the API.");
      })
      .catch((error: unknown) => {
        setScheduleMessage(error instanceof Error ? error.message : "Unable to schedule pickup.");
      });
  });
}

async function handlePod({
  order,
  podType,
  podUrl,
  setPodMessage,
  startPodTransition,
  reloadWorkspace
}: {
  order: PickupOrderRecord;
  podType: (typeof proofTypes)[number];
  podUrl: string;
  setPodMessage: (value: string) => void;
  startPodTransition: (callback: () => void) => void;
  reloadWorkspace: () => Promise<void>;
}) {
  if (!podUrl.trim()) {
    setPodMessage("Provide a proof URL before submitting POD.");
    return;
  }

  startPodTransition(() => {
    void submitPodToApi({
      orderId: order.order.id,
      type: podType,
      url: podUrl.trim()
    })
      .then(async (result) => {
        await reloadWorkspace();
        setPodMessage(result.dispute ? "POD request opened or updated a dispute through the API." : "POD accepted by the API.");
      })
      .catch((error: unknown) => {
        setPodMessage(error instanceof Error ? error.message : "Unable to submit POD.");
      });
  });
}

function isScheduleAllowed(record: PickupOrderRecord) {
  return record.order.status !== "CANCELLED" && record.order.status !== "SETTLED" && record.order.status !== "IN_DISPUTE";
}

function isPodAllowed(record: PickupOrderRecord) {
  return record.order.pickupStatus === "SCHEDULED" && isScheduleAllowed(record);
}

function isScheduleWindowValid(start: string, end: string) {
  if (!start || !end) {
    return false;
  }

  const startTime = parseLocalDateTime(start);
  const endTime = parseLocalDateTime(end);
  const now = Date.now();

  return startTime !== null && endTime !== null && startTime > now && endTime > startTime;
}

function toLocalDateTime(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function parseLocalDateTime(localDateTime: string) {
  const parsed = new Date(localDateTime);
  const time = parsed.getTime();
  return Number.isFinite(time) ? time : null;
}

function toIsoString(localDateTime: string) {
  const parsed = new Date(localDateTime);
  if (!Number.isFinite(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString();
}
