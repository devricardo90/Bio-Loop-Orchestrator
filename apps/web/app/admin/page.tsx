import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Admin overview</p>
          <h1>Operational review for buyers and disputes.</h1>
          <p className="lead">
            The admin area supports manual review of buyer approvals and dispute resolution with the same live API
            contracts exposed in `/reference`.
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
              <li>Review buyer approvals against live API state</li>
              <li>Resolve or escalate disputes from the same queue used in e2e</li>
              <li>Use consistent loading, empty, and error states during manual checks</li>
              <li>Jump to `/reference` from the workspaces when troubleshooting</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
