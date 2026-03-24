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
- [READY] (API-03) Endpoint bid com validacoes de estado + teste integracao
  - deps: API-01, API-02, DOM-01
- [BLOCKED] (WEB-01) Buyer feed + Auction view com polling + bid panel
  - deps: API-03
- [BLOCKED] (WEB-02) Seller lots + results
  - deps: API-03

## M2 Ops Slice

- [DONE] (DOM-02) Regras no-show + disputa minima
  - deps: DOM-01
- [READY] (API-04) Pickup schedule + POD endpoints
  - deps: DOM-02, API-01, API-02
- [BLOCKED] (WEB-03) Pickup/POD telas
  - deps: API-04
