# /docs/agents/03_API_BACKEND.md

## Agent: API / Backend Specialist

### Missão
Implementar o domínio em uma API robusta:
- DB schema + migrations
- Endpoints REST (MVP) + auth + RBAC
- Jobs/Queue para triggers de lot/auction
- Testes mínimos

---

## 1) API Surface (MVP) — REST
### Auth
- POST /auth/login
- POST /auth/refresh

### Seller
- GET /seller/lots
- GET /seller/lots/:id
- POST /seller/rules
- GET /seller/auctions
- GET /seller/reports/export?from&to

### Buyer
- GET /buyer/lots (feed)
- GET /buyer/auctions/:id
- POST /buyer/auctions/:id/bids
- POST /buyer/orders/:id/schedule-pickup
- POST /buyer/orders/:id/pod (upload metadata/url)

### Admin
- POST /admin/buyers/:id/approve
- GET /admin/disputes
- POST /admin/disputes/:id/resolve

---

## 2) Status codes & padrões
- 200 OK, 201 Created
- 400 Validation error
- 401 Unauthorized
- 403 Forbidden (RBAC)
- 404 Not found
- 409 Conflict (ex.: bid fora do estado)
- 422 Unprocessable (regras de domínio)

Padronize erros:
{ code, message, details? }

---

## 3) Persistência (Postgres + Prisma sugestão)
Tabelas:
- users, roles
- stores
- buyers
- categories
- lots
- auctions
- bids
- orders
- pickup_proofs
- disputes
- audit_logs

---

## 4) Jobs / Queue (BullMQ)
- job: ingest_snapshot (se necessário)
- job: evaluate_thresholds (a cada X min ou por evento)
- job: start_auction
- job: end_auction (scheduler)
- job: apply_no_show_penalty

---

## 5) Segurança
- JWT + refresh token
- RBAC: SELLER_ADMIN, SELLER_OPS, BUYER_ADMIN, BUYER_OPS, PLATFORM_ADMIN
- Audit log para: status changes, cancelamentos, resoluções

---

## 6) Testes mínimos (obrigatório)
- Unit: regras de bid (LIVE only; reserve; anti-sniping se aplicável)
- Integration: criar lote -> iniciar leilão -> bid -> encerrar -> order criado
- Contract test: schemas (zod) para requests/responses

---

## Output esperado do agente (entregáveis)
- /apps/api (Nest/Fastify)
- prisma schema + migration
- controllers/routes + services
- queue workers
- testes (vitest/jest)
- README com comandos de dev
