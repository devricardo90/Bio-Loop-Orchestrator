# BACKLOG.md

## Legenda

- READY: pode executar agora (dependencias ok)
- BLOCKED: depende de algo
- DOING: em execucao
- DONE: concluido

---

## M0 Foundation

- [DONE] (INFRA-01) Criar monorepo pnpm+turborepo com apps/api apps/web packages/domain packages/shared
  - deps: none
- [DONE] (CI-01) Pipeline CI: lint + typecheck + test
  - deps: INFRA-01

## M1 Core Trade Slice (LotAuctionBidOrder)

- [DONE] (DOM-01) Definir Domain contracts: statuses + transitions + zod schemas
  - deps: INFRA-01
- [DONE] (DOM-01B) Fallback Domain v0
  - deps: none
  - note: fallback nao foi necessario porque o contrato principal foi entregue e validado dentro do gate
- [BLOCKED] (DOM-01C) Reconcile agent output vs v0
  - deps: DOM-01B, DOM-01
  - note: executar apenas se houver divergencia entre fallback e entrega principal
- [DONE] (API-01) Prisma schema + migrations core (lots/auctions/bids/orders)
  - deps: DOM-01
- [DONE] (API-02) Auth httpOnly + CSRF + CORS allowlist
  - deps: INFRA-01
- [DONE] (API-03) Endpoint bid com validacoes de estado + teste integracao
  - deps: API-01, API-02, DOM-01
- [DONE] (WEB-01) Buyer feed + Auction view com polling + bid panel
  - deps: API-03
- [DONE] (WEB-02) Seller lots + results
  - deps: API-03

## M2 Ops Slice

- [DONE] (DOM-02) Regras no-show + disputa minima
  - deps: DOM-01
- [DONE] (API-04) Pickup schedule + POD endpoints
  - deps: DOM-02, API-01, API-02
- [DONE] (WEB-03) Pickup/POD telas
  - deps: API-04

## M5 Consolidation Slice

- [DONE] (INFRA-02) Repository hygiene: commit/ignore generated artifacts, stabilize watch:done tooling, clean workspace policy
  - deps: none
- [DONE] (WEB-04) Login seller/buyer ligado ao auth httpOnly + csrf
  - deps: API-02
- [DONE] (API-05) OpenAPI atualizado + Scalar em /reference para auth/trade/pickup endpoints
  - deps: API-03, API-04
- [DONE] (API-06) Jobs: end_auction + no_show worker/scheduler
  - deps: API-03, API-04
- [DONE] (QA-01) Release verification M1+M2: buyer + seller + pickup flows sem dead-ends
  - deps: WEB-04, API-05, API-06

## M3 Billing Slice

- [DONE] (DOM-03) Contratos de invoice, fees e export basico
  - deps: DOM-02
- [DONE] (API-07) Invoice export + fee calculation + reports basicos
  - deps: DOM-03, API-04
- [DONE] (WEB-05) Seller reports + invoice/export surfaces
  - deps: API-07

## M4 Admin Slice

- [DONE] (DOM-04) Politicas de buyer approval e dispute resolution
  - deps: DOM-02
- [DONE] (API-08) Buyer approval + disputes API
  - deps: DOM-04, API-04
- [DONE] (WEB-06) Admin buyers + disputes screens
  - deps: API-08

## M6 Post-MVP Hardening

- [READY] (API-09) Admin buyers listing real + remove fallback dependency from admin web
  - deps: API-08, WEB-06
- [READY] (API-10) RBAC enforcement real for seller/buyer/admin routes
  - deps: API-02, API-08
- [BLOCKED] (WEB-07) Session guards and role-aware routing for buyer/seller/admin
  - deps: API-10, WEB-04, WEB-06
- [BLOCKED] (QA-02) Browser e2e smoke flows for buyer, seller, admin
  - deps: WEB-07, API-09
- [BLOCKED] (INFRA-03) Observability minimum: structured logs, request ids, health/readiness checks
  - deps: API-05, API-06

---

## M10 Public Presentation & Documentation

- [DONE] (DOCS-01) Developer quickstart - original task, closed. See docs/ops/done/DOCS-01.done.md.
- [REVIEW] (DOCS-01B) README Product Clarity and Screenshot Polish
  - objective: revise README for public presentation with validated production claims, real screenshot, and product section
  - deps: DOCS-01
  - note: awaiting owner commit authorization
- [DONE] (UI-01A) Define Bio-Loop Visual Baseline and Screen Priorities
  - objective: establish official visual direction, mini design system decisions, and per-screen quality criteria before screenshots and README final
  - deps: B6-08 (design layer), PORTFOLIO-01 (evidence pack)
  - evidence: docs/design/bio-loop-visual-baseline.md
- [DONE] (UI-01B1) Landing + Login Visual Redesign (Claude Designer)
  - objective: apply approved visual design from Claude Designer (bio-loop-screens-v2.jsx) to Landing and Login screens, preserving all auth logic
  - deps: UI-01A, explicit Trigger authorization
  - evidence: docs/ops/done/UI-01B1.done.md
  - files: apps/web/app/globals.css (+474/-1), apps/web/app/page.tsx (+148/-102), apps/web/components/login-panel.tsx (+75/-53)
  - gates: typecheck PASS, build PASS (14 static routes), test PASS
  - note: commit pending authorization - final screenshots not yet captured
- [BLOCKED] (UI-01B) Apply Visual Baseline to Priority 1 and Priority 2 Screens
  - objective: apply typography scale, card/table treatment, and status badge polish to landing, login, and buyer screens; capture screenshots
  - deps: UI-01A, explicit Trigger authorization
  - note: not yet authorized
