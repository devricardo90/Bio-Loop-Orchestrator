import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell landing-shell">
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Bio Loop</p>
          <h1>Buyer operations with a live auction surface.</h1>
          <p className="lead">
            The buyer workspace is wired for polling, contract-safe bids, and
            route-level auction detail. Login now routes seller and buyer personas through the auth flow.
          </p>
          <div className="hero-meta">
            <Link href="/login" className="button button-primary">
              Open login
            </Link>
            <Link href="/buyer/feed" className="button button-primary">
              Open buyer feed
            </Link>
            <Link href="/buyer/orders" className="button button-secondary">
              Open pickup queue
            </Link>
            <Link href="/buyer/auctions/auction-husks-01" className="button button-secondary">
              Open live auction
            </Link>
            <Link href="/seller" className="button button-secondary">
              Open seller hub
            </Link>
            <Link href="/admin" className="button button-secondary">
              Open admin cockpit
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel">
            <p className="label">What is ready</p>
            <ul className="feature-list">
              <li>Buyer feed with auction cards</li>
              <li>Live auction detail with bid panel</li>
              <li>Polling every few seconds for runtime status</li>
              <li>Demo state that can sync with the real API</li>
              <li>Auth page for seller and buyer personas</li>
              <li>Admin cockpit for buyers and disputes</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
