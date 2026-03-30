"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useAuthSession } from "./auth-session";
import {
  listAdminDisputes,
  resolveDisputeOnApi,
  type CatalogScope,
  type DisputeDto,
  type DisputeResolutionDecision,
  type DisputeStatus
} from "../lib/admin-api";
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
  { value: "demo", label: "Demo only" },
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
            note: item.status === "OPEN" ? "Live admin dispute from API." : "Resolved or cancelled on the API."
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
                note: decision === "ESCALATE" ? "Escalated via the live API." : "Resolved via the live API."
              }
            : entry
        )
      );

      setMessage(
        decision === "ESCALATE"
          ? "Dispute escalated. The API keeps it open for follow-up."
          : `Dispute ${dispute.id} updated through the admin API.`
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
          description="The dispute queue is loading from the admin API."
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
            The disputes panel uses the live admin API and can reveal both seeded disputes and the imported queue from the
            Sweden Supermarkets dataset.
          </p>

          <div className="hero-meta">
            <span className="chip chip-accent">{session ? session.roleLabel : "Admin session"}</span>
            <span className="chip">{visibleDisputes.length} visible</span>
            <span className="chip">{loading ? "Loading disputes..." : "Live API"}</span>
            <span className="chip chip-muted">{scopeCounts.demo} demo</span>
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
                ? "Showing disputes that originate from the seeded demo catalog."
                : "Showing both demo and real disputes so you can compare how each catalog behaves."}
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

      <section className="metrics">
        {[
          ["Open", counts.OPEN],
          ["Resolved", counts.RESOLVED],
          ["Cancelled", counts.CANCELLED],
          ["Source", "API"]
        ].map(([label, value]) => (
          <article key={String(label)} className="metric-card">
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
              description="Switch filters or create a new dispute in the API."
              tone={error ? "error" : "empty"}
              statusLabel={error ? "Dispute API error" : "Dispute queue empty"}
              primaryAction={{ label: "Admin hub", href: "/admin" }}
              secondaryAction={{ label: "Retry", onClick: () => void refreshDisputes(filter), disabled: loading }}
            />
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
                    {dispute.status}
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

                <div className="catalog-row">
                  <span className={`catalog-chip catalog-chip-${dispute.catalog.scope}`}>
                    {dispute.catalog.scope === "real" ? "Real data" : "Demo data"}
                    <small>{dispute.catalog.dataset}</small>
                  </span>

                  <p className="muted catalog-context">
                    Source: {dispute.catalog.source} ·{" "}
                    {dispute.catalog.visibleByDefault ? "Visible by default" : "Visible when catalogScope matches"}
                  </p>
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

        <p className={`message status-message status-message-error ${error ? "message-visible" : ""}`} aria-live="polite">
          {error ? `API unavailable: ${error}` : ""}
        </p>

        <p className={`message status-message status-message-loading ${loading ? "message-visible" : ""}`} aria-live="polite">
          {loading ? "Loading disputes from the API..." : ""}
        </p>

        <p className={`message status-message status-message-success ${message ? "message-visible" : ""}`} aria-live="polite">
          {message}
        </p>
      </section>

      <ApiReferencePanel
        workspace="admin-disputes"
        title="Verify dispute resolution contracts"
        description="Use the live API reference to inspect the dispute list and resolution endpoints while validating admin actions."
      />
    </main>
  );
}
