# STATUS.md
## Milestones
- [x] M0 Foundation (repo + monorepo + CI + env + lint/typecheck)
- [ ] M1 Core Trade Slice (Lot Auction Bid Order)
- [ ] M2 Ops Slice (Pickup scheduling + POD + no-show)
- [ ] M3 Billing Slice (Invoice export + fees + basic reports)
- [ ] M4 Admin Slice (buyer approval + disputes)

- Scaffold note: pnpm+turborepo baseline created for apps/api, apps/web, packages/domain, and packages/shared.
- Foundation gate note: workspace install, root typecheck, and root build validated after fixing the Nest CLI version and API TypeScript config.
- CI gate note: lint, typecheck, and test validated with `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

---

## Contratos travados (Domain)
- [ ] LotStatus + transitions
- [ ] AuctionStatus + bid rules
- [ ] Order + pickup status
- [ ] Zod schemas (server+client)

---

## API
- [ ] Auth cookie httpOnly (login/refresh/logout/csrf)
- [ ] Core endpoints M1
- [ ] OpenAPI atualizado + Scalar em /reference
- [ ] Jobs: end_auction + no_show (M2)

---

## Web
- [ ] Login (seller/buyer)
- [ ] Buyer feed + Auction view (polling)
- [ ] Seller lots + Auction results
- [ ] Pickup/POD screens (M2)
