"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useAuthSession } from "./auth-session";
import {
  listAdminDisputes,
  resolveDisputeOnApi,
  type DisputeResolutionDecision,
  type DisputeStatus
} from "../lib/admin-api";
import {
  createDemoAdminState,
  demoDisputeStatusLabel,
  mapDisputeDecisionToStatus,
  type AdminDisputeRecord
} from "../lib/demo-admin";

type DisputeAction = {
  decision: DisputeResolutionDecision;
  label: string;
  helper: string;
};

const actions: DisputeAction[] = [
  { decision: "SETTLE", label: "Settle", helper: "Close with payment" },
  { decision: "CANCEL_ORDER", label: "Cancel order", helper: "Cancel the affected order" },
  { decision: "ESCALATE", label: "Escalate", helper: "Keep open for deeper review" }
];

const filters: Array<DisputeStatus | "ALL"> = ["ALL", "OPEN", "RESOLVED", "CANCELLED"];

export function AdminDisputesDashboard() {
  const { session, hydrated } = useAuthSession();
  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>(() => createDemoAdminState().disputes);
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const [reviewerId, setReviewerId] = useState(session?.userId ?? "admin-demo");
  const [note, setNote] = useState("Resolution reviewed in the admin cockpit.");
  const [loadingDisputeId, setLoadingDisputeId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void refreshDisputes(filter);
  }, [hydrated, filter]);

  const visibleDisputes = useMemo(() => {
    if (filter === "ALL") {
      return disputes;
    }

    return disputes.filter((dispute) => dispute.status === filter);
  }, [disputes, filter]);

  const counts = useMemo(() => {
    return disputes.reduce(
      (acc, dispute) => {
        acc[dispute.status] += 1;
        return acc;
      },
      { OPEN: 0, RESOLVED: 0, CANCELLED: 0 }
    );
  }, [disputes]);

  async function refreshDisputes(nextFilter: (typeof filters)[number]) {
    setMessage("");
    setError("");

    try {
      const payload = await listAdminDisputes(nextFilter === "ALL" ? undefined : nextFilter);
      setDisputes(
        payload.disputes.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          reason: item.reason,
          status: item.status,
          openedAt: item.openedAt,
          resolvedAt: item.resolvedAt,
          note: item.status === "OPEN" ? "Live admin dispute from API." : "Resolved or cancelled on the API."
        }))
      );
      setSource("api");
    } catch (err) {
      setDisputes(createDemoAdminState().disputes);
      setSource("demo");
      setError(err instanceof Error ? `${err.message}. Showing local demo disputes.` : "Showing local demo disputes.");
    }
  }

  async function handleResolution(dispute: AdminDisputeRecord, decision: DisputeResolutionDecision) {
    setLoadingDisputeId(dispute.id);
    setMessage("");
    setError("");

    try {
      const request = {
        disputeId: dispute.id,
        decision,
        reviewerId,
        ...(note.trim() ? { note: note.trim() } : {})
      };

      const result = await resolveDisputeOnApi({
        ...request
      });

      setDisputes((current) =>
        current.map((entry) =>
          entry.id === dispute.id
            ? {
                ...entry,
                status: result.dispute.status,
                resolvedAt: result.dispute.resolvedAt,
                note: decision === "ESCALATE" ? "Escalated via the live API." : "Resolved via the live API."
              }
            : entry
        )
      );
      setSource("api");
      setMessage(
        decision === "ESCALATE"
          ? "Dispute escalated. The API keeps it open for follow-up."
          : `Dispute ${dispute.id} updated through the admin API.`
      );
    } catch (err) {
      setDisputes((current) =>
        current.map((entry) =>
          entry.id === dispute.id
            ? {
                ...entry,
                status: mapDisputeDecisionToStatus(decision),
                resolvedAt: decision === "ESCALATE" ? null : new Date().toISOString(),
                note: decision === "ESCALATE" ? "Escalated in local fallback mode." : "Resolved in local fallback mode."
              }
            : entry
        )
      );
      setSource("demo");
      setError(err instanceof Error ? `${err.message}. Applied local fallback.` : "Applied local fallback.");
    } finally {
      setLoadingDisputeId(null);
    }
  }

  if (!hydrated) {
    return <main className="app-shell">Loading admin disputes workspace...</main>;
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Admin disputes</p>
          <h1>Resolve and monitor disputes without leaving the cockpit.</h1>
          <p className="lead">
            The disputes panel uses the live admin API when reachable. If the API is unavailable, it falls back to a
            local demo queue so the surface remains usable.
          </p>
          <div className="hero-meta">
            <span className="chip chip-accent">{session ? session.roleLabel : "Demo mode"}</span>
            <span className="chip">{visibleDisputes.length} visible</span>
            <span className="chip">{source === "api" ? "API source" : "Local fallback"}</span>
          </div>
          <div className="hero-meta">
            <Link href="/admin" className="button button-secondary">
              Admin hub
            </Link>
            <Link href="/admin/buyers" className="button button-secondary">
              Open buyers
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel admin-control-panel">
            <p className="label">Review context</p>
            <label className="field">
              <span>Reviewer ID</span>
              <input className="input" value={reviewerId} onChange={(event) => setReviewerId(event.target.value)} />
            </label>
            <label className="field">
              <span>Resolution note</span>
              <textarea
                className="input admin-textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
              />
            </label>
            <div className="filter-row">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-chip ${filter === item ? "filter-chip-active" : ""}`}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="metrics">
        {[
          ["Open", counts.OPEN],
          ["Resolved", counts.RESOLVED],
          ["Cancelled", counts.CANCELLED],
          ["Source", source === "api" ? "API" : "Demo"]
        ].map(([label, value]) => (
          <article key={label as string} className="metric-card">
            <span className="label">{label as string}</span>
            <strong>{value as string | number}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Dispute queue</p>
            <h2>Open, resolve, or escalate disputes.</h2>
          </div>
        </div>

        <div className="compact-list admin-list">
          {visibleDisputes.length === 0 ? (
            <div className="empty-state">
              <p className="eyebrow">No disputes</p>
              <h2>No disputes match the current filter.</h2>
              <p className="muted">Switch filters or create a new dispute in the API.</p>
            </div>
          ) : (
            visibleDisputes.map((dispute) => (
              <article key={dispute.id} className="seller-card admin-card">
                <div className="seller-card-top">
                  <div>
                    <p className="eyebrow">{dispute.orderId}</p>
                    <h3>{dispute.reason.replace("_", " ").toLowerCase()}</h3>
                    <p className="muted">Opened {new Date(dispute.openedAt).toLocaleString("en-GB")}</p>
                  </div>
                  <span className={`status-badge status-${dispute.status.toLowerCase()}`}>
                    {demoDisputeStatusLabel(dispute.status).toUpperCase()}
                  </span>
                </div>

                <div className="seller-card-grid">
                  <div>
                    <span className="label">Status</span>
                    <strong>{dispute.status}</strong>
                  </div>
                  <div>
                    <span className="label">Resolved at</span>
                    <strong>{dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleString("en-GB") : "Still open"}</strong>
                  </div>
                  <div>
                    <span className="label">Reason</span>
                    <strong>{dispute.reason}</strong>
                  </div>
                  <div>
                    <span className="label">Note</span>
                    <strong>{dispute.note}</strong>
                  </div>
                </div>

                <div className="admin-action-row">
                  {actions.map((action) => (
                    <button
                      key={action.decision}
                      className={`button ${action.decision === "SETTLE" ? "button-primary" : "button-secondary"}`}
                      type="button"
                      disabled={isPending || loadingDisputeId === dispute.id || dispute.status !== "OPEN"}
                      onClick={() => {
                        startTransition(() => {
                          void handleResolution(dispute, action.decision);
                        });
                      }}
                    >
                      {loadingDisputeId === dispute.id ? "Saving..." : action.label}
                    </button>
                  ))}
                </div>

                <p className="muted">{actions.map((action) => `${action.label}: ${action.helper}`).join(" | ")}</p>
              </article>
            ))
          )}
        </div>

        <p className={`message ${error ? "message-visible" : ""}`} aria-live="polite">
          {error}
        </p>
        <p className={`message ${message ? "message-visible" : ""}`} aria-live="polite">
          {message}
        </p>
      </section>
    </main>
  );
}
