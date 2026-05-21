# Bio-Loop Visual Baseline

**UI-01A | Date: 2026-05-21 | Status: DEFINED**

---

## 1. Purpose

This document defines the official visual direction for Bio-Loop before new screenshots are
captured and before the final portfolio README is written.

The platform is technically validated in production. The next constraint is visual: the current
interface reads as scaffold/template rather than a mature B2B product. This baseline corrects
that without reopening the architecture, changing contracts, or triggering a full redesign.

---

## 2. What This Document Is Not

- Not a Figma spec.
- Not a component implementation plan.
- Not a redesign of functional flows.
- Not permission to touch code, API, database, auth, or deployment.

This is a decision record. Implementation follows in a separate, explicitly authorized task.

---

## 3. Visual Direction

### 3.1 One-sentence target

> B2B premium marketplace: clean, trustworthy, and editorial -- without looking like an
> AI-generated template or a generic SaaS scaffold.

### 3.2 Adjectives that should describe the result

| Apply | Avoid |
| :--- | :--- |
| Clean | Busy |
| Trustworthy | Playful |
| Editorial | Generic |
| Industrial-commercial | Startup-template |
| Mature | Toy / demo-looking |
| Precise | Fuzzy / approximate |
| Confident | Apologetic |

### 3.3 Visual references (described, not linked)

- Bloomberg Terminal redesigned for web: dense data, clear hierarchy, no wasted space
- Stripe Dashboard: neutral ground color, strong typography, data that speaks for itself
- Linear App: tight spacing, sharp contrast, purpose-driven components
- Notion / Vercel Dashboard: restrained palette, strong serif/sans pairing, editorial feel

The Bio-Loop version should feel like a commodity trading desk, not a consumer app or a SaaS
landing page.

---

## 4. Existing Design Layer (B6-08)

The following tokens already exist in `apps/web/app/globals.css` and must be respected.
Any visual improvement builds on top of these -- it does not replace them.

### 4.1 Color tokens

| Token | Value | Role |
| :--- | :--- | :--- |
| `--accent` | `#0f5d4b` | Forest green -- CTA, live status, confirmation |
| `--gold` | `#b56b2d` | Amber -- pending, attention, seller highlight |
| `--text` | `#1a1d1f` | Near-black -- primary content |
| `--muted` | `#5f656b` | Medium gray -- labels, subtexts |
| `--bg` | `#f1eadf` | Warm cream -- global page background |
| `--panel` | `rgba(255,250,243,0.9)` | Off-white translucent -- card surfaces |
| `--border` | `rgba(26,29,31,0.12)` | Black 12% -- structural borders |
| `--shadow` | warm box-shadow | Card elevation |
| `--accent-soft` | `rgba(15,93,75,0.12)` | Green 12% -- hover/focus backgrounds |
| `--radius` | `1rem` | Base radius; cards use 28px |

### 4.2 Typography

| Usage | Font stack |
| :--- | :--- |
| Headings (h1, h2, h3), strong names | Georgia / Times New Roman (serif) |
| Body, labels, UI copy | Trebuchet MS / Avenir Next / Segoe UI (sans) |

### 4.3 Status palette (existing)

| State | Color |
| :--- | :--- |
| live / awarded / approved / resolved | accent (green) |
| pending / scheduled / open | gold (amber) |
| ended / rejected / suspended / cancelled | muted / text |

### 4.4 Components already defined

`.panel`, `.auction-card`, `.seller-card`, `.pickup-action-card`, `.compact-row`,
`.journey-step`, `.status-badge`, `.chip`

These exist. The visual gap is not missing components -- it is in how they are composed,
spaced, and weighted on each specific screen.

---

## 5. What Needs to Change

The current design layer is technically correct but under-applied. The gaps are:

### 5.1 Typography hierarchy

- H1/H2 headings often lack enough weight difference from body text.
- Numbers and metrics (prices, counts, weights) need tabular figures and stronger size contrast.
- Screen titles and section titles are not visually distinct enough from content.

### 5.2 Spacing and density

- Cards are either too airy (feel unfinished) or too dense (feel like raw data).
- The grid has inconsistent rhythm across screens.
- Tables and compact rows need better vertical breathing room.

### 5.3 Data presentation

- Tables need column alignment that makes numeric comparison readable at a glance.
- Status badges are present but their visual weight is too similar to surrounding text.
- Amounts in SEK need consistent formatting: thousands separator, fixed decimal places.

### 5.4 Empty and loading states

- Empty states currently show text only. They need a brief contextual explanation and a
  clear next action.
- Loading states should not feel like the page is broken.

### 5.5 Navigation confidence

- The active route in the sidebar/header should be unambiguous.
- Breadcrumbs or section titles should orient the user without relying on URL awareness.

### 5.6 Role identity

- Each workspace (buyer / seller / admin) should feel visually coherent within itself.
- The user should know which role they are in without reading the URL.

---

## 6. Screen Priorities

Screens are ordered by demo importance and visual ROI. Implementation must follow this order.

### Priority 1 -- Entry and Auth

| Screen | Route | Current gap | Visual goal |
| :--- | :--- | :--- | :--- |
| Landing / handoff | `/` | Reads as operator script | Reads as confident product entry point |
| Login | `/login` | Generic form | Role-aware, branded, confident |

### Priority 2 -- Buyer (transactional core)

| Screen | Route | Current gap | Visual goal |
| :--- | :--- | :--- | :--- |
| Buyer feed | `/buyer/feed` | Card grid functional but weak hierarchy | Auction cards with clear live/ended contrast |
| Auction detail | `/buyer/auctions/[id]` | Data present, not readable at a glance | Lot info, bid panel, status -- clear reading order |
| Pickup queue | `/buyer/orders` | Flat list, no urgency signal | Status-first layout, pending vs completed |
| Pickup detail | `/buyer/orders/[id]` | Action buttons unclear in priority | Primary action obvious, secondary recessed |

### Priority 3 -- Seller (operational read)

| Screen | Route | Current gap | Visual goal |
| :--- | :--- | :--- | :--- |
| Seller overview | `/seller` | Navigation hub without clear value signal | Summary metrics visible above fold |
| Lots list | `/seller/lots` | Table without priority signal | Status column dominant, live lots first |
| Results | `/seller/results` | Raw outcome list | Outcome clarity: won vs lost, amounts prominent |
| Reports | `/seller/reports` | Form + table | Summary card visible before table, export CTA prominent |

### Priority 4 -- Admin (governance closeout)

| Screen | Route | Current gap | Visual goal |
| :--- | :--- | :--- | :--- |
| Buyers list | `/admin/buyers` | Status mix hard to scan | Status badge dominant, risk label secondary |
| Disputes queue | `/admin/disputes` | Flat list, reason/status equal weight | Reason first, status second, resolved recessed |

---

## 7. Mini Design System -- Decision Record

These are decisions, not implementations. They define what the next implementation task must
produce.

### 7.1 Color

- Do not add new color tokens.
- Increase usage of `--accent` for primary CTAs and live indicators.
- Use `--gold` consistently for all pending/attention states; do not use gray for pending.
- Use `--muted` for secondary labels only, not for primary data.

### 7.2 Typography scale

| Level | Usage | Treatment |
| :--- | :--- | :--- |
| Display | Screen title, hero number | Serif, 32-40px, dark |
| Heading | Section title, card header | Serif, 20-24px, dark |
| Label | Field label, column header | Sans, 11-12px, muted, uppercase, tracked |
| Body | Description, notes | Sans, 14-15px, text |
| Mono | IDs, codes, amounts | System monospace, 13-14px |

### 7.3 Numeric formatting

- All SEK amounts: `X,XXX.XX SEK` with thousands separator.
- All weights: `XXX kg`.
- All counts: plain integer, no decimal.
- Dates: `DD MMM YYYY` or `DD MMM HH:MM` for timestamps.

### 7.4 Status badges

- Size: consistent pill, 6px vertical padding, 12px horizontal padding.
- Font: sans, 11px, uppercase, letter-spacing 0.05em.
- Colors: use existing palette strictly -- no ad-hoc badge colors.
- Icon: optional leading dot (4px, same color as text).

### 7.5 Cards

- Radius: 28px (already `--radius` extended; keep consistent).
- Shadow: `--shadow` on primary cards; no shadow on nested items.
- Border: `--border` on panels; no border inside panels unless separating rows.
- Hover: `--accent-soft` background transition (already defined).

### 7.6 Tables and compact rows

- Header row: `--muted` text, uppercase, 11px, no border-bottom accent.
- Data rows: `--text` for primary data, `--muted` for secondary.
- Numeric columns: right-aligned.
- Status columns: left-aligned with badge.
- Row hover: `--accent-soft` background.
- No zebra striping -- use border-bottom on rows instead.

### 7.7 Navigation

- Active route: `--accent` left border (3px) on sidebar items.
- Role label: visible in header, not just in a dropdown.
- Back links: explicit text link, not browser back.

### 7.8 Empty and loading states

- Empty: brief heading ("No [items] yet"), one sentence of context, one CTA if applicable.
- Loading: animated accent-colored bar or spinner, no skeleton that makes the page look broken.
- Error: clear heading, short message, retry CTA.

---

## 8. Constraints

### 8.1 Must not change

- API contracts.
- Auth flow logic.
- Route structure.
- Data sources.
- Component behavior (only visual layer).

### 8.2 Must preserve

- All existing `.status-*` class semantics.
- All existing `.workspace-state-*` class semantics.
- The `source=api` signal in buyer feed.
- The `catalogScope` badge system in admin.
- Mobile layout (must not regress below current state).

### 8.3 Mobile baseline

- Target: usable on 375px viewport without horizontal scroll.
- Cards: full width on mobile, 2-col grid on tablet (640px+), as currently implemented.
- Navigation: collapsible or drawer on mobile; tab bar acceptable.
- Tables: horizontal scroll on mobile with sticky first column for IDs.

---

## 9. Quality Criteria -- Screen Ready for Screenshot

A screen is ready for portfolio screenshot when all of the following are true:

- [ ] No placeholder text ("Lorem", "TODO", "demo value", etc.)
- [ ] Real data visible (from production seed or production API response)
- [ ] Typography hierarchy is clear at a glance (display > heading > label > body)
- [ ] Status badges are present and correctly colored
- [ ] Loading and empty states are defined (even if not triggered in screenshot)
- [ ] Navigation active state is visible
- [ ] No layout overflow on 1280px desktop
- [ ] No layout overflow on 375px mobile
- [ ] Amounts formatted consistently (SEK, kg)
- [ ] No raw IDs visible as primary content (IDs may appear as secondary/muted)

---

## 10. Screens Explicitly Out of Scope for UI-01A Implementation

The following are deferred until explicitly authorized:

- Public landing page / marketing page.
- Registration or onboarding flow.
- Settings / profile screens.
- Notification system.
- Mobile app or PWA.
- Dark mode.
- Any screen that requires a new API endpoint.

---

## 11. Next Implementation Task

This document is the input for the next authorized task:

**UI-01B -- Apply Visual Baseline to Priority 1 and Priority 2 Screens**

Scope of UI-01B (not yet authorized):
- Apply typography scale to landing and login.
- Apply card and table treatment to buyer feed, auction detail, pickup queue, pickup detail.
- Run typecheck, test, and build gates.
- Capture screenshots of the four buyer screens after visual pass.
- No API changes. No auth changes. No new routes.

UI-01B must not start without explicit Trigger authorization.

---

## 12. References

| Document | Location |
| :--- | :--- |
| Existing design layer (tokens, components) | `apps/web/app/globals.css` (BIO-LOOP DESIGN LAYER section) |
| UX journey map | `docs/ops/UX_JOURNEY_MAP.md` |
| UX friction inventory | `docs/ops/UX_FRICTION_INVENTORY.md` |
| Figma Ready checkpoint | `docs/ops/FIGMA_READY_CHECKPOINT.md` |
| BACKLOG6 (UX/Figma frente) | `docs/ops/BACKLOG6.md` |
| BACKLOG7 (portfolio growth) | `docs/ops/BACKLOG7.md` |
| Production evidence pack | `docs/portfolio/production-evidence-pack.md` |
