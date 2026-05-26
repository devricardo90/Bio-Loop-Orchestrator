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
          <h1>Seller review for lots, outcomes, and reports.</h1>
          <p className="lead">
            Use seller as the second step of the product walkthrough. This workspace shows how the same validated workflow
            supports listed lots, terminal states, and report-ready outputs from the supply side.
          </p>
          <div className="seller-bridge">
            <span className="status-badge status-scheduled">Step 2</span>
            <div>
              <strong>Move here after buyer proves the live path.</strong>
              <p>
                Seller is where the story shifts from discovery to operational control: listed lots, outcomes, and
                export-ready evidence in the same workflow.
              </p>
            </div>
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
          <div className="panel">
            <p className="label">Operational checklist</p>
            <ol className="sequence-list">
              <li>
                <strong>Open lots first</strong>
                <span>Show what the seller currently has listed before discussing outcomes.</span>
              </li>
              <li>
                <strong>Use results second</strong>
                <span>Frame settlement and terminal states as the continuation of the buyer path.</span>
              </li>
              <li>
                <strong>Close with reports</strong>
                <span>Use export-ready evidence when the audience asks for operational proof.</span>
              </li>
            </ol>
            <ul className="feature-list">
              <li>Review listed lots after the buyer path has already confirmed live product data</li>
              <li>Inspect results and settlement-ready outcomes as the seller-side continuation of the story</li>
              <li>Open reports to show export-ready operational evidence</li>
              <li>Use lot and result detail pages to answer follow-up questions without leaving the seller flow</li>
              <li>Keep the narrative tied to the same runtime later reused by admin</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
