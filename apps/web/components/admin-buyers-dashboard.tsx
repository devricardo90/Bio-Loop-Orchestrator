"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useAuthSession } from "./auth-session";
import {
  approveBuyerOnApi,
  listAdminBuyers,
  type BuyerApprovalDecision,
  type BuyerApprovalReason,
  type BuyerRecordDto
} from "../lib/admin-api";
import { ApiReferencePanel } from "./api-reference-panel";
import { WorkspaceState } from "./workspace-state";

type BuyerAction = {
  decision: BuyerApprovalDecision;
  label: string;
};

const actions: BuyerAction[] = [
  { decision: "APPROVE", label: "Approve" },
  { decision: "REJECT", label: "Reject" },
  { decision: "SUSPEND", label: "Suspend" },
  { decision: "REINSTATE", label: "Reinstate" }
];

function defaultBuyerReasonForDecision(decision: BuyerApprovalDecision): BuyerApprovalReason {
  if (decision === "APPROVE" || decision === "REINSTATE") {
    return "MANUAL_REVIEW";
  }

  if (decision === "REJECT") {
    return "COMPLIANCE";
  }

  return "PAYMENT_RISK";
}

export function AdminBuyersDashboard() {
  const { session, hydrated } = useAuthSession();
  const [buyers, setBuyers] = useState<BuyerRecordDto[]>([]);
  const [reviewerId, setReviewerId] = useState(session?.userId ?? "admin-reviewer");
  const [notes, setNotes] = useState("Manual review from the admin cockpit.");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingBuyerId, setLoadingBuyerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const statusCounts = useMemo(() => {
    return buyers.reduce(
      (acc, buyer) => {
        acc[buyer.status] += 1;
        return acc;
      },
      { PENDING: 0, APPROVED: 0, REJECTED: 0, SUSPENDED: 0 }
    );
  }, [buyers]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void refreshBuyers();
  }, [hydrated]);

  if (!hydrated) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Admin buyers"
          title="Loading admin buyers workspace."
          description="The buyer registry is loading from the admin API."
          tone="loading"
        />
      </main>
    );
  }

  async function refreshBuyers() {
    setLoading(true);
    setError("");

    try {
      const result = await listAdminBuyers();
      setBuyers(result.buyers);
    } catch (err) {
      setBuyers([]);
      setError(err instanceof Error ? err.message : "Unable to load admin buyers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(buyer: BuyerRecordDto, decision: BuyerApprovalDecision) {
    const reason = defaultBuyerReasonForDecision(decision);
    setLoadingBuyerId(buyer.buyerId);
    setError("");
    setMessage("");

    try {
      const request = {
        buyerId: buyer.buyerId,
        decision,
        reason,
        reviewerId,
        ...(notes.trim() ? { notes: notes.trim() } : {})
      };

      const result = await approveBuyerOnApi({
        ...request
      });

      setBuyers((current) =>
        current.map((entry) =>
          entry.buyerId === buyer.buyerId
            ? {
                ...entry,
                status: result.approval.status,
                notes: notes.trim() || entry.notes,
                approval: result.approval,
                updatedAt: result.approval.updatedAt ?? new Date().toISOString()
              }
            : entry
        )
      );
      setMessage(`Buyer ${buyer.name} updated through the admin API.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Buyer approval request failed.");
    } finally {
      setLoadingBuyerId(null);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Admin buyers</p>
          <h1>Approve and review buyers before they hit the trade surface.</h1>
          <p className="lead">The buyer registry is loaded from the admin API and reflects the seeded dataset.</p>
          <div className="hero-meta">
            <span className="chip chip-accent">{session ? session.roleLabel : "Admin session"}</span>
            <span className="chip">{loading ? "Loading buyers..." : `${buyers.length} buyers loaded`}</span>
            <span className="chip">{buyers.length} buyers tracked</span>
            <span className="chip">Reviewer: {reviewerId}</span>
          </div>
          <div className="hero-meta">
            <Link href="/admin" className="button button-secondary">
              Admin hub
            </Link>
            <Link href="/admin/disputes" className="button button-secondary">
              Open disputes
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
              <span>Decision note</span>
              <textarea
                className="input admin-textarea"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
              />
            </label>
            <p className="muted">
              Approval reasons are mapped by decision. Approve and reinstate use manual review; reject uses
              compliance; suspend uses payment risk.
            </p>
          </div>
        </div>
      </section>

      <section className="metrics">
        {[
          ["Pending", statusCounts.PENDING],
          ["Approved", statusCounts.APPROVED],
          ["Rejected", statusCounts.REJECTED],
          ["Suspended", statusCounts.SUSPENDED]
        ].map(([label, value]) => (
          <article key={label as string} className="metric-card">
            <span className="label">{label as string}</span>
            <strong>{value as number}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Buyer registry</p>
            <h2>Review and update buyer access.</h2>
          </div>
        </div>

        <div className="compact-list admin-list">
          {buyers.length === 0 ? (
            <WorkspaceState
              eyebrow="No buyers"
              title="No buyer records available."
              description="The admin API returned no buyers for the current workspace."
              tone={error ? "error" : "empty"}
              primaryAction={{ label: "Admin hub", href: "/admin" }}
              secondaryAction={{ label: "Retry", onClick: () => void refreshBuyers(), disabled: loading }}
            />
          ) : (
            buyers.map((buyer) => (
              <article key={buyer.id} className="seller-card admin-card">
                <div className="seller-card-top">
                  <div>
                    <p className="eyebrow">{buyer.buyerId}</p>
                    <h3>{buyer.name}</h3>
                  </div>
                  <span className={`status-badge status-${buyer.status.toLowerCase()}`}>{buyer.status}</span>
                </div>

                <div className="seller-card-grid">
                  <div>
                    <span className="label">Reputation</span>
                    <strong>{buyer.reputationScore}/100</strong>
                  </div>
                  <div>
                    <span className="label">Risk label</span>
                    <strong>{buyer.riskLabel}</strong>
                  </div>
                  <div>
                    <span className="label">Updated</span>
                    <strong>{new Date(buyer.updatedAt).toLocaleString("en-GB")}</strong>
                  </div>
                  <div>
                    <span className="label">Status note</span>
                    <strong>{buyer.notes}</strong>
                  </div>
                </div>

                {buyer.approval ? (
                  <div className="admin-note">
                    <strong>
                      {buyer.approval.decision} via {buyer.approval.reason}
                    </strong>
                    <p className="muted">
                      Reviewed by {buyer.approval.reviewerId ?? "Unknown"} on{" "}
                      {buyer.approval.reviewedAt
                        ? new Date(buyer.approval.reviewedAt).toLocaleString("en-GB")
                        : "Not reviewed yet"}
                    </p>
                    <p className="muted">{buyer.approval.notes}</p>
                  </div>
                ) : null}

                <div className="admin-action-row">
                  {actions.map((action) => (
                    <button
                      key={action.decision}
                      className={`button ${action.decision === "APPROVE" ? "button-primary" : "button-secondary"}`}
                      type="button"
                      disabled={isPending || loadingBuyerId === buyer.buyerId}
                      onClick={() => {
                        startTransition(() => {
                          void handleAction(buyer, action.decision);
                        });
                      }}
                    >
                      {loadingBuyerId === buyer.buyerId ? "Saving..." : action.label}
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>

        <p className={`message ${error ? "message-visible" : ""}`} aria-live="polite">
          {error ? `API unavailable: ${error}` : ""}
        </p>
        <p className={`message ${loading ? "message-visible" : ""}`} aria-live="polite">
          {loading ? "Loading buyer registry from the API..." : ""}
        </p>
        <p className={`message ${message ? "message-visible" : ""}`} aria-live="polite">
          {message}
        </p>
      </section>

      <ApiReferencePanel
        workspace="admin-buyers"
        title="Verify buyer approval contracts"
        description="Use the live API reference to inspect the buyers listing and approval mutation while reviewing admin decisions."
      />
    </main>
  );
}
