# BACKLOG.md

## Legenda

- READY: pode executar agora (dependencias ok)
- BLOCKED: depende de algo
- DOING: em execucao
- DONE: concluido

## Modo Pos-M7

- O orquestrador continua dono da fila e escolhe sempre o 1o item `READY`.
- Cada task tem um agente especialista principal (`owner`) e pode pedir apoio de outros subagentes no brief.
- O usuario continua sendo o gatilho manual de avancar task a task.
- Ao concluir cada task executada, o orquestrador deve gerar um commit proprio da task antes de avancar.
- Se a task tocar Prisma/API dependente de Prisma, `pnpm.cmd --filter @bio-loop/api prisma:generate` e gate obrigatorio antes de considerar a task pronta.
- O momento correto para envio de dados reais de supermercados fica documentado em [REAL_DATA_ONBOARDING.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/REAL_DATA_ONBOARDING.md).

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

- [DONE] (API-09) Admin buyers listing real + remove fallback dependency from admin web
  - deps: API-08, WEB-06
- [DONE] (API-10) RBAC enforcement real for seller/buyer/admin routes
  - deps: API-02, API-08
- [DONE] (WEB-07) Session guards and role-aware routing for buyer/seller/admin
  - deps: API-10, WEB-04, WEB-06
- [DONE] (QA-02) Browser e2e smoke flows for buyer, seller, admin
  - deps: WEB-07, API-09
- [DONE] (INFRA-03) Observability minimum: structured logs, request ids, health/readiness checks
  - deps: API-05, API-06

## M7 Runtime Validation & Demo Readiness

- [DONE] (INFRA-04) Local runtime stack: docker compose for Postgres + Redis, env bootstrap, app runbook
  - deps: INFRA-03
- [DONE] (API-11) Seed/demo data real for buyers, sellers, lots, auctions, orders, disputes, invoices
  - deps: INFRA-04
- [DONE] (WEB-08) Remove residual frontend fallbacks and bind seller/admin demo surfaces to real API data
  - deps: API-11
- [DONE] (QA-03) Manual UAT runbook for buyer, seller, admin, pickup, billing and docs/reference
  - deps: INFRA-04, API-11, WEB-08
- [DONE] (QA-04) Real browser e2e for primary flows
  - deps: QA-03
- [DONE] (DOCS-01) Developer quickstart + demo guide for local stack, seed data and Scalar reference
  - deps: INFRA-04, API-11

## M8 Post-M7 Orchestrated Expansion

### Data / Database lane

- [DONE] (DB-03) Seed v2 idempotente e orientado a cenarios
  - owner: DB Agent
  - deps: API-11, QA-04
  - output: seed reentrante, cenarios baseline/demo, ids/personas alinhados entre web e API
  - gate: `db:seed` funciona em banco vazio e em banco ja inicializado; Playwright e smoke manual continuam reproduziveis
- [DONE] (DATA-01) Onboarding de dados reais dos supermercados da Suecia
  - owner: DB Agent
  - deps: DB-03
  - output: pacote de dados reais anexado ao projeto, mapeado e validado para import controlado
  - gate: documento recebido com campos minimos obrigatorios; mapeamento origem->destino revisado; pacote validado para onboarding controlado e pronto para `DB-01`
- [DONE] (DB-01) Normalizar contratos persistidos de dados operacionais
  - owner: DB Agent
  - deps: DB-03, DATA-01
  - output: schema Prisma mais estrito para tipos/constraints operacionais
  - gate: migration aplica em banco limpo; `prisma:generate`, `db:seed` e testes de API continuam verdes
- [DONE] (DB-02) Persistencia real de billing e invoice
  - owner: DB Agent
  - deps: DB-01, API-07
  - output: entidades persistidas de invoice/export/fees e compatibilidade com seller reports
  - gate: schema + migration + Prisma Client gerado; billing segue funcional com dados persistidos
- [DONE] (DB-04) Read models e indices para queries reais
  - owner: DB Agent
  - deps: DB-02, API-13
  - output: indices/read models para buyers, disputes, reports e buyer feed
  - gate: queries criticas com indice explicito e sem regressao nos endpoints principais
  - evidencia final: `docs/ops/done/DB-04.done.md`
- [DONE] (DB-05) Hygiene de migracao e drift
  - owner: DB Agent
  - deps: DB-01, INFRA-05
  - output: verificacao de drift e migrate-deploy em banco limpo no pipeline
  - gate: pipeline falha em drift/migration invalida e ambiente limpo sobe + migra + seeda sem passo manual

### Backend / API lane

- [DONE] (API-12) Auth real com identidade persistida
  - owner: API Agent
  - deps: DB-03, API-10, API-11
  - output: login real contra usuarios persistidos, mantendo cookies e CSRF
  - gate: credencial invalida falha; usuarios seedados autenticam; e2e admin/seller continuam verdes
- [DONE] (API-13) Read-model real para buyer feed e auction detail
  - owner: API Agent
  - deps: DB-03, API-12
  - output: endpoints reais para buyer feed, auction detail e runtime de bids/pickup
  - gate: OpenAPI atualizado; responses validadas; buyer flow deixa de depender de ids locais inventados
- [DONE] (API-14) Idempotencia e auditoria para mutacoes criticas
  - owner: API Agent
  - deps: API-12, API-13
  - output: protecao contra replay/double-submit em bid, approval, dispute, pickup e POD
  - gate: repeticao nao gera efeito indevido; trilha de auditoria cobre actor, entidade e timestamp
  - evidencia final: `docs/ops/done/API-14.done.md`
- [DONE] (API-15) Jobs runtime hardening
  - owner: API Agent
  - deps: API-14, INFRA-03
  - output: locking basico, retry e visibilidade de `end_auction` e `no_show`
  - gate: scheduler nao duplica processamento e health/readiness distinguem degradacao de worker
  - evidencia final: `docs/ops/done/API-15.done.md`
- [DONE] (API-16) API production readiness pack
  - owner: API Agent
  - deps: API-13, API-15
  - output: paginacao, filtros, erros tipados e bootstrap/config seguro para exposicao menos assistida
  - gate: endpoints administrativos/listagens com shape consistente e `/reference` sem drift
  - evidencia final: `docs/ops/done/API-16.done.md`

### Frontend / Web lane

- [DONE] (WEB-09) Buyer workspace real-data convergence
  - owner: Frontend Agent
  - deps: DB-03, API-13
  - output: buyer feed, auction detail e pickup queue ligados ao backend real
  - gate: caminho principal buyer usa `source=api`; ids reais do backend; sem fallback silencioso
- [DONE] (WEB-10) Hardening de error, loading e empty states
  - owner: Frontend Agent
  - deps: WEB-09
  - output: estados operacionais consistentes para buyer, seller e admin
  - gate: sem dead-end visual e com mensagens explicitas para `loading`, `API unavailable` e `empty`
- [DONE] (WEB-11) Session lifecycle e auth UX hardening
  - owner: Frontend Agent
  - deps: API-12, WEB-10
  - output: refresh/logout/session-expired coerentes com cookie auth e `sessionStorage`
  - gate: sessao expirada redireciona corretamente e guards nao deixam a UI presa
- [DONE] (WEB-12) UX operacional conectada ao `/reference`
  - owner: Frontend Agent
  - deps: DOCS-01, WEB-10
  - output: links contextuais entre UI operacional e docs vivas da API
  - gate: navegacao entre frontend e `/reference` sem ambiguidade para troubleshoot/release review
- [DONE] (WEB-13) Manual-ops polish de demo para piloto
  - owner: Frontend Agent
  - deps: WEB-11, WEB-12
  - output: labels, navegacao e consistencia final para uso manual recorrente
  - gate: buyer/seller/admin passam checklist manual sem confusao de fluxo ou copy residual

### Infra / QA support lane

- [DONE] (INFRA-05) Runtime scripts e portas previsiveis para API/Web/DB
  - owner: Infra Agent
  - deps: DB-03
  - output: scripts de dev padronizados, sem colisao de portas e com bootstrap consistente de env
  - gate: `dev`, `dev:api`, `dev:web` sobem com comportamento previsivel em maquina limpa
- [DONE] (QA-05) Release gate pos-M7 para auth real + buyer real-data
  - owner: QA Agent
  - deps: API-12, API-13, WEB-09, WEB-11
  - output: checklist e2e/manual consolidado para buyer, seller, admin e docs/reference
  - gate: smoke manual e browser e2e passam cobrindo auth real e buyer flow sem demo fallback
