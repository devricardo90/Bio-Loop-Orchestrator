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
    commit em ingles com boas praticas de dev

## M1 Core Trade Slice (LotAuctionBidOrder)

- [DONE] (DOM-01) Definir Domain contracts: statuses + transitions + zod schemas
  - deps: INFRA-01
- [READY] (API-01) Prisma schema + migrations core (lots/auctions/bids/orders)
  - deps: DOM-01
    commit em ingles com boas praticas de dev
- [READY] (API-02) Auth httpOnly + CSRF + CORS allowlist
  - deps: INFRA-01
- [BLOCKED] (API-03) Endpoint bid com validacoes de estado + teste integracao
  - deps: API-01, API-02, DOM-01
    commit em ingles com boas praticas de dev
- [BLOCKED] (WEB-01) Buyer feed + Auction view com polling + bid panel
  - deps: API-03
- [BLOCKED] (WEB-02) Seller lots + results
  commit em ingles com boas praticas de dev
  - deps: API-03

## M2 Ops Slice

- [READY] (DOM-02) Regras no-show + disputa minima
  - deps: DOM-01
- [BLOCKED] (API-04) Pickup schedule + POD endpoints
  - deps: DOM-02, API-01, API-02
- [BLOCKED] (WEB-03) Pickup/POD telas
  - deps: API-04
