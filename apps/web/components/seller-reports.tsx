"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "./auth-session";
import {
  fetchBillingExport,
  fetchBillingSummary,
  type BillingExportFormat,
  type BillingExportSnapshot,
  type BillingSummary
} from "../lib/billing-api";
import { formatSek } from "../lib/demo-auctions";

type BillingRange = {
  fromAt: string;
  toAt: string;
};

type SellerReportsState = {
  summary: BillingSummary;
  exportSnapshot: BillingExportSnapshot | null;
  source: "api" | "demo";
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

const demoSummary = (range: BillingRange): BillingSummary => ({
  fromAt: toIso(range.fromAt),
  toAt: toIso(range.toAt),
  currency: "SEK",
  invoiceCount: 3,
  subtotalSek: 12840,
  feeTotalSek: 642,
  totalSek: 12198
});

const demoExport = (range: BillingRange, format: BillingExportFormat): BillingExportSnapshot => {
  const report = demoSummary(range);
  const invoices = [
    {
      id: "inv_demo_01",
      orderId: "order-carrots-01",
      sellerId: "seller-norrmalm",
      buyerId: "buyer-grainworks",
      currency: "SEK",
      status: "EXPORTED",
      billedWeightKg: 548,
      subtotalSek: 3726,
      feeTotalSek: 296.08,
      totalSek: 3429.92,
      issuedAt: new Date().toISOString(),
      exportedAt: new Date().toISOString(),
      lineItems: [
        {
          id: "line_demo_01",
          label: "Carrot trim lot",
          quantityKg: 548,
          unitPriceSekPerKg: 6.8,
          amountSek: 3726.4
        }
      ],
      fees: [
        { id: "fee_demo_platform", type: "PLATFORM_PERCENT", label: "Platform fee (8%)", amountSek: 298.11 }
      ]
    }
  ];

  return {
    format,
    downloadName: `billing-demo-${format.toLowerCase()}.${format.toLowerCase()}`,
    invoiceCount: invoices.length,
    report,
    invoices,
    content:
      format === "CSV"
        ? "invoiceId,orderId,sellerId,buyerId,subtotalSek,feeTotalSek,totalSek,issuedAt\ninv_demo_01,order-carrots-01,seller-norrmalm,buyer-grainworks,3726,296.08,3429.92,2026-03-24T00:00:00.000Z"
        : JSON.stringify({ invoices, report }, null, 2)
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
      setState({ summary, exportSnapshot: null, source: "api" });
    } catch (err) {
      const summary = demoSummary(nextRange);
      setState({ summary, exportSnapshot: null, source: "demo" });
      setError(err instanceof Error ? err.message : "Billing API unavailable. Showing local demo data.");
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
          exportSnapshot: snapshot,
          source: "api"
        }));
        setMessage(`Export ready: ${snapshot.downloadName}`);
      })
      .catch((err: unknown) => {
        const snapshot = demoExport(range, format);
        setState((current) => ({
          summary: current?.summary ?? snapshot.report,
          exportSnapshot: snapshot,
          source: "demo"
        }));
        setMessage(err instanceof Error ? `${err.message}. Showing local export demo.` : "Showing local export demo.");
      })
      .finally(() => setExportLoading(false));
  }

  const exportHref = exportSnapshot
    ? `data:text/${format === "CSV" ? "csv" : "json"};charset=utf-8,${encodeURIComponent(exportSnapshot.content)}`
    : null;

  if (!hydrated) {
    return <main className="app-shell">Loading billing workspace...</main>;
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Seller billing</p>
          <h1>Invoices, fees, and export for settled orders.</h1>
          <p className="lead">
            The billing surface mirrors the API summary/export endpoints and keeps a visible fallback when the API is
            offline.
          </p>
          <div className="hero-meta">
            <span className="chip chip-accent">{session ? session.roleLabel : "Demo mode"}</span>
            <span className="chip">{rangeLabel}</span>
            <span className="chip">{state?.source === "api" ? "API data" : "Local demo fallback"}</span>
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

      <section className="metrics">
        {summary
          ? [
              ["Invoices", summary.invoiceCount],
              ["Subtotal", formatSek(summary.subtotalSek)],
              ["Fees", formatSek(summary.feeTotalSek)],
              ["Total", formatSek(summary.totalSek)]
            ].map(([label, value]) => (
              <article key={label as string} className="metric-card">
                <span className="label">{label as string}</span>
                <strong>{value as string | number}</strong>
              </article>
            ))
          : null}
      </section>

      <section className="seller-layout">
        <div className="panel seller-list-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Reports</p>
              <h2>Export settled invoices or inspect the summary snapshot</h2>
            </div>
          </div>

          <div className="pickup-action-grid">
            <div className="pickup-action-card">
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
                  ? "The export uses the live API when available and falls back to a demo snapshot when needed."
                  : "The page is visible in demo mode. Sign in as seller to mirror the httpOnly auth flow."}
              </p>
            </div>

            <div className="pickup-action-card">
              <p className="label">Current status</p>
              <h3>{loading ? "Loading billing snapshot..." : summary ? `${summary.invoiceCount} invoices` : "Waiting for data"}</h3>
              <p className="muted">
                {state
                  ? state.source === "api"
                    ? "Live report data loaded from the API."
                    : "Demo report snapshot shown because the API was unavailable."
                  : "Refresh the window to load the current billing report."}
              </p>
              <p className={`message ${error ? "message-visible" : ""}`}>{error}</p>
              <p className={`message ${message ? "message-visible" : ""}`} aria-live="polite">
                {message}
              </p>
            </div>
          </div>

          <div className="compact-list" style={{ marginTop: "18px" }}>
            {exportSnapshot ? (
              exportSnapshot.invoices.map((invoice) => (
                <article key={invoice.id} className="seller-card">
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
              <div className="empty-state">
                <p className="eyebrow">No invoices</p>
                <h2>No settled invoices were found in this window.</h2>
                <p className="muted">Adjust the date range or export a wider billing window.</p>
              </div>
            ) : summary ? (
              <article className="seller-card">
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
            ) : null}
          </div>
        </div>

        <aside className="panel seller-spotlight">
          <p className="eyebrow">Billing notes</p>
          <h2>What the export includes</h2>
          <div className="status-timeline">
            {[
              ["Invoice summary", "Invoice count, subtotal, fees, and total for the selected window."],
              ["CSV/JSON export", "A direct export snapshot that can be downloaded or piped into reporting."],
              ["Fallback mode", "Local demo snapshot is shown when the API is offline or unreachable."]
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
