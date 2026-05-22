"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "./auth-session";
import { formatAuthRoleLabel } from "../lib/auth-api";
import {
  fetchBillingExport,
  fetchBillingSummary,
  type BillingExportFormat,
  type BillingExportSnapshot,
  type BillingSummary
} from "../lib/billing-api";
import { formatSek } from "../lib/demo-auctions";
import { ApiReferencePanel } from "./api-reference-panel";
import { WorkspaceState } from "./workspace-state";

type BillingRange = {
  fromAt: string;
  toAt: string;
};

type SellerReportsState = {
  summary: BillingSummary;
  exportSnapshot: BillingExportSnapshot | null;
};

const defaultRange = (): BillingRange => {
  const now = new Date();
  const toAt = new Date(now);
  const fromAt = new Date(now);
  fromAt.setDate(fromAt.getDate() - 7);

  return {
    fromAt: toIso(fromAt),
    toAt: toIso(toAt)
  };
};

export function SellerReports() {
  const { session, hydrated } = useAuthSession();
  const [range, setRange] = useState<BillingRange>(() => defaultRange());
  const [format, setFormat] = useState<BillingExportFormat>("CSV");
  const [state, setState] = useState<SellerReportsState | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canUseSellerSession = Boolean(session?.role === "seller" || session?.roleLabel === "SELLER_ADMIN");
  const summary = state?.summary ?? null;
  const exportSnapshot = state?.exportSnapshot ?? null;
  const rangeLabel = useMemo(
    () => `${new Date(range.fromAt).toLocaleDateString("en-GB")} to ${new Date(range.toAt).toLocaleDateString("en-GB")}`,
    [range.fromAt, range.toAt]
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void refreshReports(range);
  }, [hydrated, range.fromAt, range.toAt]);

  async function refreshReports(nextRange: BillingRange) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const summary = await fetchBillingSummary({
        fromAt: toIso(nextRange.fromAt),
        toAt: toIso(nextRange.toAt)
      });
      setState({ summary, exportSnapshot: null });
    } catch (err) {
      setState(null);
      setError(err instanceof Error ? err.message : "Billing workspace unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setExportLoading(true);
    setMessage("");

    void fetchBillingExport(
      {
        fromAt: toIso(range.fromAt),
        toAt: toIso(range.toAt)
      },
      format
    )
      .then((snapshot) => {
        setState((current) => ({
          summary: current?.summary ?? snapshot.report,
          exportSnapshot: snapshot
        }));
        setMessage(`Export ready: ${snapshot.downloadName}`);
      })
      .catch((err: unknown) => {
        setMessage(err instanceof Error ? err.message : "Billing export request failed.");
      })
      .finally(() => setExportLoading(false));
  }

  const exportHref = exportSnapshot
    ? `data:text/${format === "CSV" ? "csv" : "json"};charset=utf-8,${encodeURIComponent(exportSnapshot.content)}`
    : null;

  if (!hydrated) {
    return (
      <main className="app-shell">
        <WorkspaceState
          eyebrow="Seller billing"
          title="Loading billing workspace."
          description="The summary snapshot and export surface are loading from the product workspace."
          tone="loading"
        />
      </main>
    );
  }

  return (
    <main className="app-shell seller-reports-shell">
      <section className="hero seller-reports-hero">
        <div className="hero-copy">
          <p className="eyebrow">Seller billing</p>
          <h1>Invoices, fees, and export for settled orders.</h1>
          <p className="lead">
            The billing surface mirrors the live reporting workspace with a clear readout of invoices,
            fees, totals, and export readiness.
          </p>
          <div className="hero-meta">
            <span className="chip chip-accent">{session ? formatAuthRoleLabel(session.roleLabel) : "Seller session"}</span>
            <span className="chip">{rangeLabel}</span>
            <span className="chip">{loading ? "Loading billing..." : "Live data"}</span>
          </div>
          <div className="hero-meta">
            <Link href="/seller" className="button button-secondary">
              Seller hub
            </Link>
            <Link href="/seller/results" className="button button-secondary">
              Seller results
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel seller-summary-panel">
            <p className="label">Billing window</p>
            <div className="seller-detail-grid">
              <label className="field">
                <span>From</span>
                <input
                  className="input"
                  type="date"
                  value={range.fromAt.slice(0, 10)}
                  onChange={(event) =>
                    setRange((current) => ({
                      ...current,
                      fromAt: toLocalDateString(event.target.value)
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>To</span>
                <input
                  className="input"
                  type="date"
                  value={range.toAt.slice(0, 10)}
                  onChange={(event) =>
                    setRange((current) => ({
                      ...current,
                      toAt: toLocalDateString(event.target.value)
                    }))
                  }
                />
              </label>
            </div>
            <button className="button button-primary" type="button" onClick={() => void refreshReports(range)} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh reports"}
            </button>
          </div>
        </div>
      </section>

      <section className="metrics billing-summary-metrics">
        {summary
          ? [
              ["Invoices", summary.invoiceCount],
              ["Subtotal", formatSek(summary.subtotalSek)],
              ["Fees", formatSek(summary.feeTotalSek)],
              ["Total", formatSek(summary.totalSek)]
            ].map(([label, value]) => (
              <article key={label as string} className="metric-card billing-metric-card">
                <span className="label">{label as string}</span>
                <strong>{value as string | number}</strong>
              </article>
            ))
          : null}
      </section>

      <section className="seller-layout billing-layout">
        <div className="panel seller-list-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Reports</p>
              <h2>Export settled invoices or inspect the summary snapshot</h2>
            </div>
          </div>

          <div className="pickup-action-grid billing-action-grid">
            <div className="pickup-action-card billing-action-card">
              <p className="label">Export format</p>
              <div className="filter-row">
                {(["CSV", "JSON"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`filter-chip ${format === item ? "filter-chip-active" : ""}`}
                    onClick={() => setFormat(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button className="button button-primary" type="button" onClick={() => void handleExport()} disabled={exportLoading || !canUseSellerSession}>
                {exportLoading ? "Exporting..." : "Export reports"}
              </button>
              {exportHref ? (
                <a className="button button-secondary" href={exportHref} download={exportSnapshot?.downloadName}>
                  Download export
                </a>
              ) : null}
              <p className="muted">
                {canUseSellerSession
                  ? "The export uses live report data for the selected billing window."
                  : "Sign in as seller to use the secure session flow."}
              </p>
            </div>

            <div className="pickup-action-card billing-action-card billing-status-card">
              <p className="label">Current status</p>
              <h3>{loading ? "Loading billing snapshot..." : summary ? `${summary.invoiceCount} invoices` : "Waiting for data"}</h3>
              <p className="muted">
                {state ? "Live report data loaded." : "Refresh the window to load the current billing report."}
              </p>
              <p className={`message ${error ? "message-visible" : ""}`}>{error}</p>
              <p className={`message ${message ? "message-visible" : ""}`} aria-live="polite">
                {message}
              </p>
            </div>
          </div>

          <div className="compact-list billing-invoice-list">
            {exportSnapshot ? (
              exportSnapshot.invoices.map((invoice) => (
                <article key={invoice.id} className="seller-card billing-invoice-card">
                  <div className="seller-card-top">
                    <div>
                      <p className="eyebrow">{invoice.status}</p>
                      <h3>{invoice.id}</h3>
                    </div>
                    <span className="status-badge status-awarded">{invoice.currency}</span>
                  </div>
                  <div className="seller-card-grid">
                    <div>
                      <span className="label">Subtotal</span>
                      <strong>{formatSek(invoice.subtotalSek)}</strong>
                    </div>
                    <div>
                      <span className="label">Fees</span>
                      <strong>{formatSek(invoice.feeTotalSek)}</strong>
                    </div>
                    <div>
                      <span className="label">Total</span>
                      <strong>{formatSek(invoice.totalSek)}</strong>
                    </div>
                    <div>
                      <span className="label">Issued</span>
                      <strong>{new Date(invoice.issuedAt).toLocaleString("en-GB")}</strong>
                    </div>
                  </div>
                  <pre className="billing-export-preview">{exportSnapshot.content}</pre>
                </article>
              ))
            ) : summary?.invoiceCount === 0 ? (
              <WorkspaceState
                eyebrow="No invoices"
                title="No settled invoices were found in this window."
                description="Adjust the date range or refresh a wider billing window."
                tone="empty"
                secondaryAction={{ label: "Refresh reports", onClick: () => void refreshReports(range), disabled: loading }}
              />
            ) : summary ? (
              <article className="seller-card billing-invoice-card">
                <div className="seller-card-top">
                  <div>
                    <p className="eyebrow">Summary</p>
                    <h3>Aggregate billing snapshot</h3>
                  </div>
                  <span className="status-badge status-live">{summary.currency}</span>
                </div>
                <div className="seller-card-grid">
                  <div>
                    <span className="label">Invoice count</span>
                    <strong>{summary.invoiceCount}</strong>
                  </div>
                  <div>
                    <span className="label">Subtotal</span>
                    <strong>{formatSek(summary.subtotalSek)}</strong>
                  </div>
                  <div>
                    <span className="label">Fees</span>
                    <strong>{formatSek(summary.feeTotalSek)}</strong>
                  </div>
                  <div>
                    <span className="label">Total</span>
                    <strong>{formatSek(summary.totalSek)}</strong>
                  </div>
                </div>
              </article>
            ) : (
              <WorkspaceState
                eyebrow="No data"
                title="No billing report is loaded yet."
                description="Use the selected date range and refresh the reports."
                tone={error ? "error" : "empty"}
                secondaryAction={{ label: "Refresh reports", onClick: () => void refreshReports(range), disabled: loading }}
              />
            )}
          </div>
        </div>

        <aside className="panel seller-spotlight billing-notes-panel">
          <p className="eyebrow">Billing notes</p>
          <h2>What the export includes</h2>
          <div className="status-timeline">
            {[
              ["Invoice summary", "Invoice count, subtotal, fees, and total for the selected window."],
              ["CSV/JSON export", "A direct export snapshot that can be downloaded or piped into reporting."],
              ["Live data", "The surface reads from the current billing workspace."]
            ].map(([label, description]) => (
              <div key={label} className="timeline-step timeline-step-complete">
                <span className="timeline-step-marker" />
                <div>
                  <strong>{label}</strong>
                  <p className="muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <ApiReferencePanel
          workspace="seller-billing"
          title="Verify billing workflow"
          description="Open the product reference when you need to inspect summary and export behavior while checking seller billing output."
        />
      </section>
    </main>
  );
}

function toLocalDateString(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function toIso(localDate: string | Date) {
  return new Date(localDate).toISOString();
}
