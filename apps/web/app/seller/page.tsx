import Link from "next/link";

export const metadata = {
  title: "Seller overview",
  description: "Seller lots, results, and billing operations"
};

export default function SellerHomePage() {
  return (
    <main className="app-shell landing-shell">
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Seller overview</p>
          <h1>Operational control for lots, outcomes, and billing.</h1>
          <p className="lead">
            The seller area is tuned for manual review of listed lots, terminal states, and billing outputs tied to
            the current API-backed runtime.
          </p>
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
          <div className="panel">
            <p className="label">Operational checklist</p>
            <ul className="feature-list">
              <li>Review listed lots and current auction states</li>
              <li>Inspect results and settlement-ready outcomes</li>
              <li>Export billing snapshots for settled orders</li>
              <li>Open lot detail pages for specific auction outcomes</li>
              <li>Validate seller behavior against the same runtime seen by buyer and admin</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
