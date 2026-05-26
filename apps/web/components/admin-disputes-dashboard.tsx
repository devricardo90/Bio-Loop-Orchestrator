"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { formatAuthRoleLabel } from "../lib/auth-api";
import { useAuthSession } from "./auth-session";
import {
  listAdminDisputes,
  resolveDisputeOnApi,
  type CatalogScope,
  type DisputeDto,
  type DisputeResolutionDecision,
  type DisputeStatus
} from "../lib/admin-api";
import { formatDateSafe, formatEnumLabel } from "../lib/demo-auctions";
import { ApiReferencePanel } from "./api-reference-panel";
import { WorkspaceState } from "./workspace-state";

type AdminDisputeRecord = DisputeDto & {
  note: string;
};

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

const scopeFilters: Array<{ value: CatalogScope; label: string }> = [
  { value: "all", label: "All catalogs" },
  { value: "demo", label: "Sample only" },
  { value: "real", label: "Real data only" }
];

const filters: Array<DisputeStatus | "ALL"> = ["ALL", "OPEN", "RESOLVED", "CANCELLED"];

export function AdminDisputesDashboard() {
  const { session, hydrated } = useAuthSession();
  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const [reviewerId, setReviewerId] = useState(session?.userId ?? "admin-reviewer");
  const [note, setNote] = useState("Resolution reviewed in the admin cockpit.");
  const [loadingDisputeId, setLoadingDisputeId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [catalogScope, setCatalogScope] = useState<CatalogScope>("all");

  const refreshDisputes = useCallback(
    async (nextFilter: (typeof filters)[number]) => {
      setLoading(true);
      setMessage("");
      setError("");

      try {
        const query: { status?: DisputeStatus; catalogScope?: CatalogScope } = {
          catalogScope
        };

        if (nextFilter !== "ALL") {
          query.status = nextFilter;
        }

        const payload = await listAdminDisputes(query);

        setDisputes(
          payload.disputes.map((item) => ({
            ...item,
            note: item.status === "OPEN" ? "Open admin dispute." : "Resolved or cancelled."
          }))
        );
      } catch (err) {
        setDisputes([]);
        setError(err instanceof Error ? err.message : "Unable to load admin disputes.");
      } finally {
        setLoading(false);
      }
    },
    [catalogScope]
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void refreshDisputes(filter);
  }, [hydrated, filter, refreshDisputes]);

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

  const scopeCounts = useMemo(
    () =>
      disputes.reduce(
        (acc, dispute) => {
          acc[dispute.catalog.scope] += 1;
          return acc;
        },
        { demo: 0, real: 0 }
      ),
    [disputes]
  );

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

      const result = await resolveDisputeOnApi(request);

      setDisputes((current) =>
        current.map((entry) =>
          entry.id === dispute.id
            ? {
                ...entry,
                status: result.dispute.status,
                resolvedAt: result.dispute.resolvedAt,
                note: decision === "ESCALATE" ? "Escalated for follow-up." : "Resolved in the workspace."
              }
            : entry
        )
      );

      setMessage(
        decision === "ESCALATE"
          ? "Dispute escalated and kept open for follow-up."
          : `Dispute ${dispute.id} updated in the admin workspace.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update dispute.");
    } finally {
      setLoadingDisputeId(null);
    }
  }

  if (!hydrated) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Admin disputes"
          title="Loading admin disputes workspace."
          description="The dispute queue is loading from the admin workspace."
          tone="loading"
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Admin disputes</p>
          <h1>Resolve and monitor disputes without leaving the cockpit.</h1>
          <p className="lead">
            The disputes panel uses the live admin workspace and can reveal both sample catalog disputes and the imported queue from the
            Sweden Supermarkets dataset.
          </p>

          <div className="hero-meta">
            <span className="chip chip-accent">{session ? formatAuthRoleLabel(session.roleLabel) : "Admin session"}</span>
            <span className="chip">{visibleDisputes.length} visible</span>
            <span className="chip">{loading ? "Loading disputes..." : "Live data"}</span>
            <span className="chip chip-muted">{scopeCounts.demo} sample</span>
            <span className="chip chip-muted">{scopeCounts.real} real</span>
          </div>

          <div className="filter-row">
            {scopeFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`filter-chip ${catalogScope === option.value ? "filter-chip-active" : ""}`}
                onClick={() => setCatalogScope(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="muted">
            {catalogScope === "real"
              ? "Showing disputes tied to the real Sweden Supermarkets catalog."
              : catalogScope === "demo"
                ? "Showing disputes from the sample catalog."
                : "Showing both sample and real disputes so you can compare how each catalog behaves."}
          </p>

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

      <section className="metrics admin-summary-metrics">
        {[
          ["Open", counts.OPEN],
          ["Resolved", counts.RESOLVED],
          ["Cancelled", counts.CANCELLED],
          ["Data", "Live"]
        ].map(([label, value]) => (
          <article key={String(label)} className="metric-card admin-metric-card">
            <span className="label">{label}</span>
            <strong>{value}</strong>
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
            <WorkspaceState
              eyebrow="No disputes"
              title="No disputes match the current filter."
              description="Switch filters or create a new dispute from the workspace flow."
              tone={error ? "error" : "empty"}
              statusLabel={error ? "Dispute workspace error" : "Dispute queue empty"}
              primaryAction={{ label: "Admin hub", href: "/admin" }}
              secondaryAction={{ label: "Retry", onClick: () => void refreshDisputes(filter), disabled: loading }}
            />
          ) : (
            visibleDisputes.map((dispute) => (
              <article key={dispute.id} className="seller-card admin-card admin-review-card admin-dispute-card">
                <div className="seller-card-top admin-review-head">
                  <div>
                    <p className="eyebrow">{dispute.orderId}</p>
                    <h3>{formatEnumLabel(dispute.reason)}</h3>
                    <p className="muted">Opened {formatDateSafe(dispute.openedAt)}</p>
                  </div>

                  <span className={`status-badge status-${dispute.status.toLowerCase()}`}>
                    {formatEnumLabel(dispute.status)}
                  </span>
                </div>

                <div className="admin-review-strip">
                  <div>
                    <span className="label">Priority</span>
                    <strong>{dispute.status === "OPEN" ? "Needs review" : "Closed"}</strong>
                  </div>
                  <div>
                    <span className="label">Resolution</span>
                    <strong>{formatDateSafe(dispute.resolvedAt, "Still open")}</strong>
                  </div>
                  <div>
                    <span className="label">Catalog</span>
                    <strong>{dispute.catalog.dataset}</strong>
                  </div>
                </div>

                <div className="admin-action-row admin-decision-row">
                  <button
                    className="button button-primary"
                    onClick={() => handleResolution(dispute, "CANCEL_ORDER")}
                    disabled={isPending || loadingDisputeId === dispute.id || dispute.status !== "OPEN"}
                    title="Closing the dispute in favor of the buyer will trigger a full refund."
                  >
                    {loadingDisputeId === dispute.id ? "Processing..." : "Award Buyer"}
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => handleResolution(dispute, "SETTLE")}
                    disabled={isPending || loadingDisputeId === dispute.id || dispute.status !== "OPEN"}
                    title="Closing in favor of the seller will finalize the payout as originally scheduled."
                  >
                    {loadingDisputeId === dispute.id ? "Processing..." : "Award Seller"}
                  </button>
                </div>
                <p className="muted small admin-action-note">
                  Resolving a dispute is final. Both parties will be notified by the workspace events.
                </p>

                <div className="seller-card-grid admin-detail-grid">
                  <div>
                    <span className="label">Status</span>
                    <strong>{formatEnumLabel(dispute.status)}</strong>
                  </div>
                  <div>
                    <span className="label">Resolved at</span>
                    <strong>{formatDateSafe(dispute.resolvedAt, "Still open")}</strong>
                  </div>
                  <div>
                    <span className="label">Reason</span>
                    <strong>{formatEnumLabel(dispute.reason)}</strong>
                  </div>
                  <div>
                    <span className="label">Note</span>
                    <strong>{dispute.note}</strong>
                  </div>
                </div>

                <div className="catalog-row">
                  <span className={`catalog-chip catalog-chip-${dispute.catalog.scope}`}>
                    {dispute.catalog.scope === "real" ? "Real data" : "Sample data"}
                    <small>{dispute.catalog.dataset}</small>
                  </span>

                  <p className="muted catalog-context">
                    {dispute.catalog.visibleByDefault ? "Visible in default review" : "Visible when this catalog is selected"}
                  </p>
                </div>

                <div className="admin-action-row admin-decision-row admin-secondary-decision-row">
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

                <p className="muted admin-helper-line">{actions.map((action) => `${action.label}: ${action.helper}`).join(" | ")}</p>
              </article>
            ))
          )}
        </div>

        <p className={`message status-message status-message-error ${error ? "message-visible" : ""}`} aria-live="polite">
          {error ? `Workspace unavailable: ${error}` : ""}
        </p>

        <p className={`message status-message status-message-loading ${loading ? "message-visible" : ""}`} aria-live="polite">
          {loading ? "Loading disputes..." : ""}
        </p>

        <p className={`message status-message status-message-success ${message ? "message-visible" : ""}`} aria-live="polite">
          {message}
        </p>
      </section>

      <ApiReferencePanel
        workspace="admin-disputes"
        title="Verify dispute workflow"
        description="Open the product reference when you need to inspect dispute list and resolution behavior while validating admin actions."
      />
    </main>
  );
}
