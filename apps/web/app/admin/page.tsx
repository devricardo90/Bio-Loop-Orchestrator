import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Platform admin</p>
          <h1>Admin surface for buyers and disputes.</h1>
          <p className="lead">
            The admin cockpit closes the M4 slice with buyer approval and dispute resolution surfaces aligned to the
            live API.
          </p>
          <div className="hero-meta">
            <Link href="/admin/buyers" className="button button-primary">
              Open buyers
            </Link>
            <Link href="/admin/disputes" className="button button-secondary">
              Open disputes
            </Link>
            <Link href="/login" className="button button-secondary">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel">
            <p className="label">Included surfaces</p>
            <ul className="feature-list">
              <li>Buyer approval queue with API-backed actions</li>
              <li>Dispute list and resolution actions</li>
              <li>Loading, empty, and error states</li>
              <li>Fallback demo data when the API is not reachable</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
