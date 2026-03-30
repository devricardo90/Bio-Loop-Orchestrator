import Link from "next/link";

const handoffTracks = [
  {
    eyebrow: "Buyer track",
    title: "Buyer operations",
    summary: "Validate feed, auction detail, bidding, and pickup against the API-backed runtime.",
    primaryHref: "/buyer/feed",
    primaryLabel: "Open buyer feed",
    secondaryHref: "/buyer/orders",
    secondaryLabel: "Open pickup queue",
    checklist: "Confirm source=api, then review live auction detail and pickup readiness."
  },
  {
    eyebrow: "Seller track",
    title: "Seller operations",
    summary: "Review lots, outcomes, and reports from the same shared runtime used by buyer and admin.",
    primaryHref: "/seller/lots",
    primaryLabel: "Open seller lots",
    secondaryHref: "/seller/results",
    secondaryLabel: "Open seller results",
    checklist: "Verify listed lots, terminal states, and billing-ready outputs before handoff."
  },
  {
    eyebrow: "Admin track",
    title: "Admin operations",
    summary: "Approve buyers, resolve disputes, and cross-check the contracts exposed in /reference.",
    primaryHref: "/admin/buyers",
    primaryLabel: "Open buyer approvals",
    secondaryHref: "/admin/disputes",
    secondaryLabel: "Open dispute queue",
    checklist: "Use catalogScope filters and dataset badges to separate real and demo records."
  }
] as const;

export default function HomePage() {
  return (
    <main className="app-shell landing-shell">
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Bio Loop</p>
          <h1>One pilot handoff for buyer, seller, and admin operations.</h1>
          <p className="lead">
            Use this page as the pilot-ready dashboard handoff for operators who need a single starting point instead
            of memorizing internal routes. Each track below opens the validated workflow already connected to real
            auth, API-backed runtime data, and the current admin review surfaces.
          </p>
          <div className="tag-row">
            <span className="chip chip-accent">Pilot-ready dashboard handoff</span>
            <span className="chip">Buyer source=api validated</span>
            <span className="chip">Seller runtime shared with buyer</span>
            <span className="chip">Admin catalogScope clarity shipped</span>
          </div>
          <div className="hero-meta">
            <Link href="/login" className="button button-primary">
              Sign in
            </Link>
            <Link href="/reference" className="button button-secondary">
              API reference
            </Link>
            <Link href="/buyer/auctions/auction-husks-01" className="button button-secondary">
              Live auction
            </Link>
          </div>
        </div>

        <div className="hero-side">
          <div className="panel">
            <p className="label">Executive handoff sequence</p>
            <ul className="feature-list">
              <li>Sign in once and reuse the same authenticated session across every workspace</li>
              <li>Start with buyer flow to confirm source=api and the live auction path</li>
              <li>Move to seller lots and results to review the same runtime from the supply side</li>
              <li>Finish in admin buyers and disputes to close the operational loop</li>
              <li>Open `/reference` whenever a manual check needs contract confirmation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="handoff-grid" aria-label="Pilot handoff tracks">
        {handoffTracks.map((track) => (
          <article key={track.title} className="panel handoff-card">
            <div className="panel-head">
              <div>
                <p className="eyebrow">{track.eyebrow}</p>
                <h2>{track.title}</h2>
              </div>
              <span className="status-badge status-live">Ready</span>
            </div>
            <p className="muted">{track.summary}</p>
            <p className="handoff-checklist">{track.checklist}</p>
            <div className="hero-meta">
              <Link href={track.primaryHref} className="button button-primary">
                {track.primaryLabel}
              </Link>
              <Link href={track.secondaryHref} className="button button-secondary">
                {track.secondaryLabel}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
