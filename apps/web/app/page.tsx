import Link from "next/link";

const handoffTracks = [
  {
    eyebrow: "Buyer track",
    title: "Buyer operations",
    summary: "Show the API-backed buyer path first: feed, live auction, and pickup in one controlled flow.",
    primaryHref: "/buyer/feed",
    primaryLabel: "Open buyer feed",
    secondaryHref: "/buyer/orders",
    secondaryLabel: "Open pickup queue",
    checklist: "Start here to prove source=api, then open the live auction and confirm pickup readiness."
  },
  {
    eyebrow: "Seller track",
    title: "Seller operations",
    summary: "Move to seller once buyer is clear, then review lots, outcomes, and export-ready reports.",
    primaryHref: "/seller/lots",
    primaryLabel: "Open seller lots",
    secondaryHref: "/seller/results",
    secondaryLabel: "Open seller results",
    checklist: "Confirm listed lots, terminal states, and reports before handing the story to admin."
  },
  {
    eyebrow: "Admin track",
    title: "Admin operations",
    summary: "Close the loop in admin with buyer approvals, disputes, and catalogScope visibility.",
    primaryHref: "/admin/buyers",
    primaryLabel: "Open buyer approvals",
    secondaryHref: "/admin/disputes",
    secondaryLabel: "Open dispute queue",
    checklist: "Use catalogScope and dataset badges to explain demo versus real records without ambiguity."
  }
] as const;

export default function HomePage() {
  return (
    <main className="app-shell landing-shell">
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Bio Loop</p>
          <h1>One guided demo path across buyer, seller, and admin.</h1>
          <p className="lead">
            Use this page as the single operator handoff for a controlled demo. The sequence is intentional: prove the
            buyer path first, move through seller review, then finish in admin with contracts and dataset clarity still
            anchored to the validated runtime.
          </p>
          <div className="tag-row">
            <span className="chip chip-accent">Guided pilot demo</span>
            <span className="chip">Buyer source=api first</span>
            <span className="chip">Seller review second</span>
            <span className="chip">Admin closeout with catalogScope</span>
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
              <li>Sign in once and keep the same authenticated session across the whole demo</li>
              <li>Start with buyer to prove source=api, live auction continuity, and pickup access</li>
              <li>Move to seller to show lots, outcomes, and reports on the same validated baseline</li>
              <li>Finish in admin to explain approvals, disputes, and real versus demo catalog visibility</li>
              <li>Open `/reference` whenever the audience asks how the UI maps to live contracts</li>
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
              <span className="status-badge status-live">Demo step</span>
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
