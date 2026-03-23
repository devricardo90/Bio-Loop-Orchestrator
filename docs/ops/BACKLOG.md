# BACKLOG.md
## Legenda
- READY: pode executar agora (dependências ok)
- BLOCKED: depende de algo
- DOING: em execução
- DONE: concluído

---

## M0 Foundation
- [DONE] (INFRA-01) Criar monorepo pnpm+turborepo com apps/api apps/web packages/domain packages/shared
  - deps: none
- [DONE] (CI-01) Pipeline CI: lint + typecheck + test
  - deps: INFRA-01

## M1 Core Trade Slice (LotAuctionBidOrder)
- [READY] (DOM-01) Definir Domain contracts: statuses + transitions + zod schemas
  - deps: INFRA-01
- [BLOCKED] (API-01) Prisma schema + migrations core (lots/auctions/bids/orders)
  - deps: DOM-01
- [READY] (API-02) Auth httpOnly + CSRF + CORS allowlist
  - deps: INFRA-01
- [BLOCKED] (API-03) Endpoint bid com validações de estado + teste integração
  - deps: API-01, API-02, DOM-01
- [BLOCKED] (WEB-01) Buyer feed + Auction view com polling + bid panel
  - deps: API-03
- [BLOCKED] (WEB-02) Seller lots + results
  - deps: API-03

## M2 Ops Slice
- [BLOCKED] (DOM-02) Regras no-show + disputa mínima
  - deps: DOM-01
- [BLOCKED] (API-04) Pickup schedule + POD endpoints
  - deps: DOM-02, API-01, API-02
- [BLOCKED] (WEB-03) Pickup/POD telas
  - deps: API-04
