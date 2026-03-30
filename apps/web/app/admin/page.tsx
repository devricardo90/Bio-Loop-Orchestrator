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
          <div className="admin-bridge">
            <span className="status-badge status-ended">Step 3</span>
            <div>
              <strong>Use admin as the closing layer of trust.</strong>
              <p>
                This is where the story shifts from buyer and seller activity into governance, approvals, disputes,
                and clear dataset boundaries.
              </p>
            </div>
          </div>
          <div className="journey-banner admin-journey-banner">
            <div className="journey-banner-copy">
              <span className="journey-badge">Operational governance</span>
              <strong>Approvals {"->"} disputes {"->"} dataset clarity</strong>
              <p>
                Admin should read like the closing layer of the product: who gets access, how exceptions are handled,
                and how real versus demo data stays explicit.
              </p>
            </div>
            <div className="journey-banner-steps">
              <span className="journey-step journey-step-active">1. Buyers</span>
              <span className="journey-step">2. Disputes</span>
              <span className="journey-step">3. Catalog scope</span>
            </div>
          </div>
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
            <ol className="sequence-list">
              <li>
                <strong>Open buyers first</strong>
                <span>Use approvals to explain who can reach the trade surface and why governance matters.</span>
              </li>
              <li>
                <strong>Use disputes second</strong>
                <span>Show how the admin layer closes exceptions without breaking the operational loop.</span>
              </li>
              <li>
                <strong>Finish with dataset clarity</strong>
                <span>Use `catalogScope` and badges to explain demo versus real records clearly.</span>
              </li>
            </ol>
            <ul className="feature-list">
              <li>Open buyers first to show approvals on the live admin surface</li>
              <li>Use `catalogScope` and dataset badges to explain real versus demo records</li>
              <li>Move to disputes to show the operational loop closing without dead-ends</li>
              <li>Jump to `/reference` whenever the audience asks for contract-level confirmation</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="buyer-context-strip" aria-label="Admin closeout context">
        <article className="panel context-card">
          <p className="eyebrow">Why admin comes last</p>
          <h2>Admin turns the product story into controlled operations.</h2>
          <p className="muted">
            After buyer proves demand and seller proves inventory control, admin explains governance, exception
            handling, and the visible boundary between demo and real data.
          </p>
        </article>
        <article className="panel context-card">
          <p className="eyebrow">What to verify</p>
          <ul className="feature-list">
            <li>Use buyer approvals to frame operational access and control</li>
            <li>Use disputes as the proof that the loop can close without dead-ends</li>
            <li>Keep `catalogScope` and dataset badges visible when discussing real versus demo</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
