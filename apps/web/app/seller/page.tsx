import Link from "next/link";

export const metadata = {
  title: "Seller hub",
  description: "Seller lots and results workspace"
};

export default function SellerHomePage() {
  return (
    <main className="app-shell landing-shell">
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Seller hub</p>
          <h1>Operational control for lots and outcomes.</h1>
          <p className="lead">
            The seller surface tracks lots, auction states, and final results with the same contract-safe runtime
            used by the buyer flow.
          </p>
          <div className="hero-meta">
            <Link href="/seller/lots" className="button button-primary">
              Open seller lots
            </Link>
            <Link href="/seller/results" className="button button-secondary">
              Open seller results
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel">
            <p className="label">What is ready</p>
            <ul className="feature-list">
              <li>Seller lots list with live and terminal states</li>
              <li>Results view with revenue and settlement timeline</li>
              <li>Lot detail pages for individual auction outcomes</li>
              <li>Shared demo state synced with the buyer workspace</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
