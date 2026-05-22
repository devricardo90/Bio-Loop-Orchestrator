import Link from "next/link";

/* Icons adapted from Claude Designer bio-loop-screens-v2.jsx */
const AuctionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v4m0 0l2.5-1.5M8 6L5.5 4.5M3 9h10M4 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M5 4h8M5 8h8M5 12h6M2 4h.5M2 8h.5M2 12h.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 6.5 3-1 5.5-3 5.5-6.5V4L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M6 8l1.5 1.5L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PulseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1 8h3l1.5-4 2 8L9.5 5l1.5 3h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Workspace tracks */
const handoffTracks = [
  {
    title: "Buyer Operations",
    desc: "Bid on surplus lots, track live auctions, manage pickup.",
    stats: ["source=api", "6 active lots"],
    primaryHref: "/buyer/feed",
    primaryLabel: "Open feed",
    secondaryHref: "/buyer/orders",
    secondaryLabel: "Pickup queue",
    badgeClass: "status-live",
    badgeLabel: "Step 1",
    Icon: AuctionIcon,
  },
  {
    title: "Seller Operations",
    desc: "List lots, review outcomes, export billing reports.",
    stats: ["4 listed lots", "1 invoice"],
    primaryHref: "/seller/lots",
    primaryLabel: "Open lots",
    secondaryHref: "/seller/results",
    secondaryLabel: "Results",
    badgeClass: "status-scheduled",
    badgeLabel: "Step 2",
    Icon: ListIcon,
  },
  {
    title: "Admin Operations",
    desc: "Approve buyers, resolve disputes, manage datasets.",
    stats: ["4 buyers", "3 disputes"],
    primaryHref: "/admin/buyers",
    primaryLabel: "Open approvals",
    secondaryHref: "/admin/disputes",
    secondaryLabel: "Disputes",
    badgeClass: "status-neutral",
    badgeLabel: "Step 3",
    Icon: ShieldIcon,
  },
];

/* Static demo activity labeled as demo snapshot */
const activityItems = [
  { text: "Bid placed - Bakery Surplus", time: "2m ago", live: true },
  { text: "Produce Grade B - new bid", time: "8m ago", live: true },
  { text: "Meat Trim lot awarded", time: "1h ago", live: false },
];

export default function HomePage() {
  return (
    <main className="app-shell landing-shell">
      {/* guided demo path: Buyer source=api first. Seller review second. Admin closeout with catalogScope. */}
      {/* Hero zone: green gradient section */}
      <div className="hero-zone">
        <section className="hero hero-home">
          {/* Left: headline */}
          <div className="hero-copy">
            <p className="eyebrow">
              Operations Console{" "}
              <span className="hero-source-tag">- source=api</span>
            </p>
            <h1>Surplus commodity trading, end to end.</h1>
            <p className="lead">
              Guided workflow across buyer, seller, and admin - from live
              auction to pickup to settlement. All data API-backed.
            </p>
            <div className="hero-meta">
              <Link href="/login" className="button button-primary">
                Sign in
              </Link>
              <Link
                href="/buyer/auctions/auction-husks-01"
                className="button button-secondary"
              >
                View live auction
              </Link>
              <Link href="/reference" className="button button-secondary">
                API reference
              </Link>
            </div>
          </div>

          {/* Right: static platform status panel */}
          <div className="hero-side">
            <div className="panel status-panel-card">
              <div className="status-panel-header">
                <div className="status-panel-header-left">
                  <PulseIcon />
                  <span>Platform Status</span>
                </div>
                <span className="status-panel-demo-tag">
                  <span className="status-panel-demo-dot" />
                  Demo snapshot
                </span>
              </div>
              <div className="status-panel-stats">
                <div className="status-panel-stat">
                  <div className="status-panel-stat-label">Active Lots</div>
                  <div
                    className="status-panel-stat-value"
                    style={{ color: "var(--accent)" }}
                  >
                    6
                  </div>
                </div>
                <div className="status-panel-stat">
                  <div className="status-panel-stat-label">Volume</div>
                  <div className="status-panel-stat-value">2,020</div>
                  <div className="status-panel-stat-unit">kg</div>
                </div>
              </div>
              <div className="status-panel-activity">
                <div className="status-panel-activity-label">
                  Recent Activity
                </div>
                {activityItems.map((item, i) => (
                  <div key={i} className="status-panel-activity-item">
                    <div className="status-panel-activity-left">
                      <span
                        className="status-panel-activity-dot"
                        style={{
                          background: item.live
                            ? "var(--accent)"
                            : "var(--muted)",
                        }}
                      />
                      <span>{item.text}</span>
                    </div>
                    <span className="status-panel-activity-time">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Workspaces section */}
      <div className="workspaces-section">
        <div className="workspaces-header">
          <h2 className="section-label">Workspaces</h2>
          <span className="section-meta">3 roles - cookie-based auth</span>
        </div>
        <div className="handoff-grid" aria-label="Pilot handoff tracks">
          {handoffTracks.map((track) => (
            <article key={track.title} className="panel handoff-card">
              <div className="handoff-card-bar" />
              <div className="handoff-card-body">
                <div className="handoff-card-title-row">
                  <div className="handoff-card-title-left">
                    <div className="handoff-card-icon">
                      <track.Icon />
                    </div>
                    <h3 className="handoff-card-name">{track.title}</h3>
                  </div>
                  <span className={`status-badge ${track.badgeClass}`}>
                    {track.badgeLabel}
                  </span>
                </div>
                <p className="handoff-card-desc">{track.desc}</p>
                <div className="handoff-card-stats">
                  {track.stats.map((s) => (
                    <span key={s} className="handoff-card-stat-chip">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="handoff-card-actions">
                  <Link
                    href={track.primaryHref}
                    className="button button-primary button-sm"
                  >
                    {track.primaryLabel}
                  </Link>
                  <Link
                    href={track.secondaryHref}
                    className="button button-ghost button-sm"
                  >
                    {track.secondaryLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
