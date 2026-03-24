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
- [READY] (API-08) Buyer approval + disputes API
  - deps: DOM-04, API-04
- [BLOCKED] (WEB-06) Admin buyers + disputes screens
  - deps: API-08
