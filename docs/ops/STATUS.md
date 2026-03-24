# STATUS.md
## Milestones
- [x] M0 Foundation (repo + monorepo + CI + env + lint/typecheck)
- [x] M1 Core Trade Slice (Lot Auction Bid Order)
- [x] M2 Ops Slice (Pickup scheduling + POD + no-show)
- [ ] M3 Billing Slice (Invoice export + fees + basic reports)
- [ ] M4 Admin Slice (buyer approval + disputes)
- [ ] M5 Consolidation Slice (login + API docs + jobs + QA/release hardening)

- Scaffold note: pnpm+turborepo baseline created for apps/api, apps/web, packages/domain, and packages/shared.
- Foundation gate note: workspace install, root typecheck, and root build validated after fixing the Nest CLI version and API TypeScript config.
- CI gate note: lint, typecheck, and test validated with `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

---

## Contratos travados (Domain)
- [x] LotStatus + transitions
- [x] AuctionStatus + bid rules
- [x] Order + pickup status
- [x] Zod schemas (server+client)
- [x] PickupStatus + pickup flow
- [x] DisputeStatus + dispute minimum flow

---

## API
- [x] Core persistence schema + Prisma migration for lots/auctions/bids/orders
- [x] Auth cookie httpOnly (login/refresh/logout/csrf)
- [x] Core endpoints M1
- [x] Pickup schedule + POD endpoints
- [ ] OpenAPI atualizado + Scalar em /reference
- [ ] Jobs: end_auction + no_show (M2)

---

## Web
- [ ] Login (seller/buyer)
- [x] Buyer feed + Auction view (polling)
- [x] Seller lots + Auction results
- [x] Pickup/POD screens (M2)

---

## Consolidation Notes
- M1 e M2 estao funcionalmente entregues no repo e publicados no backlog como DONE.
- O proximo foco correto nao e abrir novas telas aleatorias; e consolidar o fluxo com login, OpenAPI, jobs e release verification.
- Existem mudancas operacionais fora do backlog atual (`package.json`, `tools/`, `tsbuildinfo`) que precisam ser tratadas como hygiene task separada.
- INFRA-02 fecha a política de workspace limpo e o tooling `watch:done`; a próxima funcao de produto é `WEB-04` login seller/buyer.
