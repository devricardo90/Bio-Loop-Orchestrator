import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Admin overview</p>
          <h1>Admin closeout for approvals, disputes, and dataset clarity.</h1>
          <p className="lead">
            Use admin as the final step of the guided demo. This workspace closes the loop with buyer approvals,
            dispute handling, and clear separation between demo and real catalog records.
          </p>
          <div className="hero-meta">
            <Link href="/admin/buyers" className="button button-primary">
              Buyer approvals
            </Link>
            <Link href="/admin/disputes" className="button button-secondary">
              Dispute queue
            </Link>
            <Link href="/login" className="button button-secondary">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel">
            <p className="label">Operational checklist</p>
            <ul className="feature-list">
              <li>Open buyers first to show approvals on the live admin surface</li>
              <li>Use `catalogScope` and dataset badges to explain real versus demo records</li>
              <li>Move to disputes to show the operational loop closing without dead-ends</li>
              <li>Jump to `/reference` whenever the audience asks for contract-level confirmation</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
