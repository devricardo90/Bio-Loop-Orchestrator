# STATUS.md
## Milestones
- [x] M0 Foundation (repo + monorepo + CI + env + lint/typecheck)
- [x] M1 Core Trade Slice (Lot Auction Bid Order)
- [x] M2 Ops Slice (Pickup scheduling + POD + no-show)
- [x] M3 Billing Slice (Invoice export + fees + basic reports)
- [x] M4 Admin Slice (buyer approval + disputes)
- [x] M5 Consolidation Slice (login + API docs + jobs + QA/release hardening)
- [x] M6 Post-MVP Hardening (real admin data + RBAC + e2e + observability)
- [x] M7 Runtime Validation & Demo Readiness (local stack + seed + real demo flows + UAT)

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
- [x] Invoice + fee + export billing contracts
- [x] Buyer approval + dispute resolution contracts
- [x] Admin buyers listing real (API-09)
- [x] RBAC enforcement real for seller/buyer/admin routes (API-10)

---

## API
- [x] Core persistence schema + Prisma migration for lots/auctions/bids/orders
- [x] Auth cookie httpOnly (login/refresh/logout/csrf)
- [x] Core endpoints M1
- [x] Pickup schedule + POD endpoints
- [x] OpenAPI atualizado + Scalar em /reference
- [x] Jobs: end_auction + no_show (M2)
- [x] Invoice export + fee calculation + reports basicos (M3 core)
- [x] Buyer approval + disputes API (API-08)
- [x] Admin buyers listing real (API-09)

---

## Web
- [x] Login (seller/buyer)
- [x] Buyer feed + Auction view (polling)
- [x] Seller lots + Auction results
- [x] Pickup/POD screens (M2)
- [x] Session guards + role-aware routing for buyer/seller/admin (WEB-07)

---

## Consolidation Notes
- M1 e M2 estao funcionalmente entregues no repo e publicados no backlog como DONE.
- O M5 consolidou login, API docs, jobs e QA/release verification.
- Existem mudancas operacionais fora do backlog atual (`package.json`, `tools/`, `tsbuildinfo`) que precisam ser tratadas como hygiene task separada.
- INFRA-02 fecha a politica de workspace limpo e o tooling `watch:done`.
- WEB-04 fecha o login seller/buyer e `API-05` fecha o contrato publico da API.
- API-05 fecha o contrato publico da API; o backlog agora aponta `API-06` como proxima `READY`.
- API-06 fecha a automacao de `end_auction` e `no_show`; `QA-01` agora e a proxima task de verificacao.
- QA-01 fechou a verificacao de release do slice M1+M2 com `PASS`.
- API-07 fecha o core de billing com export, fee calculation e reports basicos; WEB-05 fecha as surfaces de seller para esse fluxo.
- M3 Billing Slice foi consolidado com DOM-03, API-07 e WEB-05.
- DOM-04 fecha o contrato de buyer approval e dispute resolution; `API-08` agora e a proxima task `READY`.
- API-08 fecha a API de buyer approval + disputes; WEB-06 fecha a surface admin do web com buyers + disputes, com fallback local apenas para listagem de buyers.
- API-09 fecha a listagem real de buyers no backend admin; a proxima melhoria de hardening e remover o fallback do web quando o consumo real for ligado.
- API-10 fecha o enforcement real de RBAC nas rotas buyer, seller e admin.
- QA-02 fechou a verificacao de smoke flows de buyer, seller e admin; o unico alerta remanescente foi a limitacao de `next build` no ambiente atual (`spawn EPERM`).
- INFRA-03 fechou a base de observabilidade minima com request ids, logging estruturado e health/readiness checks.
- O proximo passo correto e tirar o produto do estado de "repo validado" para "stack local demonstravel", com banco, redis, seed real, remocao de fallbacks residuais e roteiro de UAT.
- WEB-08 fecha a remocao de fallbacks residuais no frontend seller/admin; o proximo foco e documentacao operacional do stack e UAT manual.
- API-11 fechou a base de demo real com buyers, lots, auctions, orders, disputes e dados prontos para billing.
- O proximo passo operacional e remover os fallbacks residuais do frontend em `WEB-08` e documentar o fluxo de demo em `DOCS-01`.
- INFRA-04 fechou a base de runtime local com docker compose, bootstrap de env e runbook para API/Web/Scalar.
- QA-03 fechou o runbook manual de UAT para buyer, seller, admin, pickup, billing e `/reference`.
- DOCS-01 fechou o quickstart do desenvolvedor com stack local, seed data, demo access e guia de uso do Scalar em `/reference`.
- QA-04 fechou a suite Playwright real com browser flows para buyer, seller e admin, usando stack e2e isolado com Postgres/Redis, API e web reais.
- O milestone M7 agora fecha com stack local, seed data, docs, UAT manual e browser e2e principal automatizado.
- A proxima fase correta nao e mais MVP slice; agora o backlog passa a ser orquestrado por especialista (`DB Agent`, `API Agent`, `Frontend Agent`, `Infra Agent`, `QA Agent`) com fila unificada pelo orquestrador.
- DB-03 fechou o seed v2 com catalogo de cenarios gerenciados, limpeza direcionada de IDs legacy e alinhamento dos cenarios-base com buyer live, seller billing e admin disputes.
- `DATA-01` fechou com o pacote real dos supermercados da Suecia anexado em `data/real-data/sweden-supermarkets/incoming/`, mapeamento revisado e checklist de onboarding controlado preenchido.
- `DB-01` fechou a normalizacao minima do schema operacional com `externalId`, metadata estruturada para stores/buyers/lots, labels de categoria e a relacao `BuyerCategoryInterest`, sem quebrar os fluxos atuais.
- `DB-02` fechou a persistencia real de billing com `Invoice`, `InvoiceFee` e `BillingExport`, e o seller reports agora opera sobre artefatos persistidos em vez de calculo efemero puro.
- `API-12` fechou o login real contra usuarios persistidos com `passwordHash` seedado, mantendo cookies httpOnly, refresh e CSRF no mesmo fluxo.
- `API-13` fechou os endpoints reais de buyer feed e auction detail, e o buyer workspace principal agora consome IDs e registros vindos da API em vez do catalogo local inventado.
- `WEB-09` fechou a convergencia do buyer workspace para dados reais no frontend, incluindo pickup queue e order detail sem fallback silencioso no caminho principal.
- `WEB-10` fechou a padronizacao dos estados de loading, API unavailable e empty em buyer, pickup, admin e billing, removendo dead-ends visuais e adicionando CTAs de retry/retorno.
- `WEB-11` fechou o endurecimento do ciclo de sessao no frontend com refresh na reidratacao, refresh agendado antes da expiracao, redirect para login em sessao expirada e UX coerente entre guard, header e tela de login.
- `WEB-12` conectou buyer, pickup, admin e billing ao `/reference` com acesso global no header e callouts contextuais por workspace para facilitar troubleshoot e release review.
- `WEB-13` fechou o polish final de manual ops no web com labels mais claras, navegação mais consistente, limpeza de copy residual de demo/cockpit/hub e um loading padronizado para seller.
- `QA-05` fechou o gate pos-M7 com um checklist unico para auth real, buyer real-data, seller/admin review e docs vivas, alem de endurecer as assertions browser para `source=api`, `/reference` e sessao expirada.
- `QA-06` fechou o browser e2e expandido do buyer real-data com captura de snapshot via `page.request`, validacao do fluxo buyer feed -> auction detail -> pickup detail e gate verde em Chromium.
- `INFRA-05` fechou a previsibilidade operacional do runtime com bootstrap automatico de `.env`, separacao entre `API_PORT` e `WEB_PORT`, script de web dev orientado por env e docs alinhadas ao stack real.
- `DB-05` fechou a hygiene de migracao com gate explicito de drift, verify-clean cross-platform e validacao no pipeline contra Postgres limpo.
- Nao ha task `READY` restante no backlog atual.
- O momento correto para o usuario enviar os dados reais dos supermercados da Suecia e logo apos `DB-03`; os campos/documentos necessarios ficam em [REAL_DATA_ONBOARDING.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/REAL_DATA_ONBOARDING.md).
- Em 2026-04-15, o deploy base de vitrine foi registrado como DONE: Web na Vercel, API na Railway, Postgres e Redis ativos, `/health`, `/readiness`, `/openapi.json` e `/reference` validados.
- Em 2026-04-20, a investigacao localizada de CORS/CSRF confirmou CORS correto para `https://bio-loop-orchestrator-web.vercel.app` e handshake CSRF consistente no codigo e via cliente HTTP.
- Auth em producao permanece `BLOCKED` no browser porque o cookie `csrf_token` nao e reenviado no `POST /auth/login` cross-site entre Vercel e Railway; a proxima solucao deve ser operacional de dominio/same-site, nao refactor de aplicacao.
- Nenhuma task `READY` foi criada ou promovida por esse checkpoint.

## Nota historica

- este snapshot fecha o recorte ate o fim de `M8`
- o fechamento validado de `M9` foi consolidado depois em `docs/ops/BACKLOG2.md` e nos relatórios de `docs/ops/done/`
