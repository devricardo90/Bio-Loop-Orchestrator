import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell landing-shell">
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Bio Loop</p>
          <h1>Operational review across buyer, seller, pickup, and admin.</h1>
          <p className="lead">
            The local stack now supports manual validation with real auth, API-backed buyer flows, admin review
            surfaces, billing exports, and direct links to the live API reference.
          </p>
          <div className="hero-meta">
            <Link href="/login" className="button button-primary">
              Sign in
            </Link>
            <Link href="/buyer/feed" className="button button-primary">
              Buyer operations
            </Link>
            <Link href="/buyer/orders" className="button button-secondary">
              Pickup operations
            </Link>
            <Link href="/buyer/auctions/auction-husks-01" className="button button-secondary">
              Live auction
            </Link>
            <Link href="/seller" className="button button-secondary">
              Seller overview
            </Link>
            <Link href="/admin" className="button button-secondary">
              Admin overview
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel">
            <p className="label">Recommended manual path</p>
            <ul className="feature-list">
              <li>Sign in with seeded buyer, seller, or admin credentials</li>
              <li>Review buyer feed, live auction, and pickup queue against the API</li>
              <li>Open seller overview, results, and billing exports</li>
              <li>Approve buyers and resolve disputes in admin operations</li>
              <li>Cross-check each flow with the live `/reference` docs</li>
              <li>Use this page as the handoff point for manual release review</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
