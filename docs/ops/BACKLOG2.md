# BACKLOG2

Snapshot operacional real em `2026-03-30`.

Base de classificacao usada neste arquivo:

- documentacao principal lida: `README.md`, `docs/ops/BACKLOG.md`, `docs/ops/BACKLOG1.md`, `docs/ops/STATUS.md`, `docs/ops/STATUS1.md`
- estrutura e codigo conferidos em `apps/api`, `apps/web`, `packages/domain`, `tests`, `.github/workflows`
- este diagnostico NAO reexecutou app, build, lint, typecheck, testes ou migrations
- por isso, so entram em `DONE` itens com evidencia rastreavel de implementacao + gate registrado no proprio repo

Observacoes:

- o backlog historico validado ate `M8` continua em `docs/ops/BACKLOG.md` e em `docs/ops/done/*.done.md`
- este `BACKLOG2` passa a ser a verdade operacional do frontier atual a partir de `M9`

## DONE

### DB-04 - Read models e indices para queries reais
- descricao: indices Prisma e narrowing de read-models para buyer/admin/billing
- camada: database + api
- dependencias: DB-02, API-13
- criterios de aceitacao:
  - migration aplicada em banco limpo
  - `prisma:generate` validado
  - testes de API/Web sem regressao
  - seed continua funcional
- evidencia real:
  - implementacao no schema/migrations/services/testes
  - gate registrado em `docs/ops/done/DB-04.done.md`
- status real: DONE

### API-17 - Ingest API para dados reais
- descricao: endpoint administrativo para `dry-run` e `apply` do dataset real da Suecia
- camada: api
- dependencias: DATA-02, API-16
- criterios de aceitacao:
  - endpoint exposto com validacao
  - dry-run vs apply distintos
  - auditoria de ingestao em execucoes efetivas
  - test/typecheck registrados
- evidencia real:
  - implementacao em `apps/api/src/admin/*`
  - gate resumido em `docs/ops/done/API-17.done.md`
- status real: DONE

### API-14 - Idempotencia e auditoria para mutacoes criticas
- descricao: protecao contra replay/double-submit e trilha de auditoria em bids, approvals, disputes, pickup e POD
- camada: api
- dependencias: API-12, API-13
- criterios de aceitacao:
  - repeticao nao gera efeito indevido
  - auditoria registra actor, entidade e timestamp
  - gate de typecheck/test/build documentado
- evidencia encontrada:
  - codigo em `apps/api/src/mutations/*`, `apps/api/src/trades/*`, `apps/api/src/admin/*`
  - teste dedicado em `apps/api/test/api-14.integration.test.mjs`
  - validacao executada em `2026-03-30`: `pnpm.cmd --filter @bio-loop/api typecheck` PASS, `pnpm.cmd --filter @bio-loop/api build` PASS, `pnpm.cmd --filter @bio-loop/api test` PASS
  - `pnpm.cmd --filter @bio-loop/api prisma:generate` PASS apos encerrar processos `node` do workspace e limpar arquivos temporarios presos do engine Prisma no Windows
  - relatorio registrado em `docs/ops/done/API-14.done.md`
- status real: DONE

### API-15 - Jobs runtime hardening
- descricao: locking, retry e visibilidade para `end_auction` e `no_show`
- camada: api
- dependencias: API-14
- criterios de aceitacao:
  - scheduler nao duplica processamento
  - retries controlados
  - readiness/worker status distinguem degradacao
  - gate documentado
- evidencia encontrada:
  - codigo em `apps/api/src/jobs/api-jobs.service.ts`
  - teste dedicado em `apps/api/test/api-15.integration.test.mjs`
  - validacao executada em `2026-03-30`: `pnpm.cmd --filter @bio-loop/api typecheck` PASS, `pnpm.cmd --filter @bio-loop/api build` PASS, `pnpm.cmd --filter @bio-loop/api test` PASS
  - `pnpm.cmd --filter @bio-loop/api prisma:generate` PASS apos encerrar processos `node` do workspace e limpar arquivos temporarios presos do engine Prisma no Windows
  - relatorio registrado em `docs/ops/done/API-15.done.md`
- status real: DONE

### API-16 - API production readiness pack
- descricao: paginacao, filtros, erros tipados e shapes mais estaveis para listagens/admin
- camada: api
- dependencias: API-13, API-15
- criterios de aceitacao:
  - endpoints administrativos/listagens com shape consistente
  - filtros/paginacao padronizados
  - `/reference` coerente com os contratos
  - gate documentado
- evidencia encontrada:
  - codigo em `apps/api/src/admin/*`
  - teste dedicado em `apps/api/test/api-16.integration.test.mjs`
  - validacao executada em `2026-03-30`: `pnpm.cmd --filter @bio-loop/api typecheck` PASS, `pnpm.cmd --filter @bio-loop/api build` PASS, `pnpm.cmd --filter @bio-loop/api test` PASS
  - `pnpm.cmd --filter @bio-loop/api prisma:generate` PASS apos encerrar processos `node` do workspace e limpar arquivos temporarios presos do engine Prisma no Windows
  - relatorio registrado em `docs/ops/done/API-16.done.md`
- status real: DONE

### DATA-02 - Import controlado dos supermercados da Suecia
- descricao: import reproducivel de stores, contacts, pickup windows, categories, buyers e lots
- camada: data + database
- dependencias: DB-04, API-16
- criterios de aceitacao:
  - dry-run e apply consistentes
  - import preserva seed demo
  - validacao de integridade documentada
  - gate documentado
- evidencia encontrada:
  - script em `apps/api/prisma/import-real-data.mjs`
  - teste dedicado em `apps/api/test/data-02.integration.test.mjs`
  - docs atualizadas em `docs/ops/REAL_DATA_ONBOARDING.md`
  - validacao executada em `2026-03-30`: `node apps/api/test/data-02.integration.test.mjs` PASS, `pnpm.cmd --filter @bio-loop/api db:import-real:dry-run` PASS, `pnpm.cmd --filter @bio-loop/api db:import-real` PASS, `pnpm.cmd --filter @bio-loop/api test` PASS
  - `pnpm.cmd --filter @bio-loop/api prisma:generate` PASS apos encerrar processos `node` do workspace e limpar arquivos temporarios presos do engine Prisma no Windows
  - relatorio registrado em `docs/ops/done/DATA-02.done.md`
- status real: DONE

### DATA-03 - Catalogo operacional misto demo + real
- descricao: convivencia controlada entre dataset demo e dataset real
- camada: data + api + web
- dependencias: DATA-02
- criterios de aceitacao:
  - defaults conservadores para QA manual/e2e
  - filtros `catalogScope` coerentes entre API e web
  - docs/gate documentados
- evidencia encontrada:
  - filtros/defaults em `apps/api/src/admin/*`
  - consumo/labels no web em `apps/web/components/admin-*.tsx`
  - docs atualizadas em `docs/ops/REAL_DATA_ONBOARDING.md`
  - validacao executada em `2026-03-30`: `node apps/api/test/api-16.integration.test.mjs` PASS, `pnpm.cmd --filter @bio-loop/api test` PASS, `pnpm.cmd --filter @bio-loop/web test` PASS
  - `pnpm.cmd --filter @bio-loop/api prisma:generate` PASS apos encerrar processos `node` do workspace e limpar arquivos temporarios presos do engine Prisma no Windows
  - relatorio registrado em `docs/ops/done/DATA-03.done.md`
- status real: DONE

### WEB-14 - Seller surfaces em dados reais da API
- descricao: seller lots/results menos dependentes de estado derivado local
- camada: web
- dependencias: DB-04, API-16
- criterios de aceitacao:
  - seller usa dados reais ou read-model dedicado
  - sem ambiguidade de origem
  - gate documentado
- evidencia encontrada:
  - alteracoes em `apps/web/components/seller-dashboard.tsx` e `apps/web/components/auction-store.tsx`
  - o runtime seller consome o estado compartilhado do `AuctionStoreProvider`, que e reidratado via `fetchBuyerFeed()` da API real
  - validacao executada em `2026-03-30`: `pnpm.cmd --filter @bio-loop/web test` PASS, `pnpm.cmd --filter @bio-loop/web build` PASS, `pnpm.cmd --filter @bio-loop/web typecheck` PASS, `node apps/api/test/api-16.integration.test.mjs` PASS
  - relatorio registrado em `docs/ops/done/WEB-14.done.md`
- status real: DONE

### WEB-15 - Admin operational clarity for real data
- descricao: filtros e badges para distinguir catalogo demo vs real em buyers/disputes
- camada: web
- dependencias: API-16, DATA-02
- criterios de aceitacao:
  - admin distingue claramente demo vs real
  - consumo alinhado ao `catalogScope`
  - gate documentado
- evidencia encontrada:
  - alteracoes em `apps/web/components/admin-buyers-dashboard.tsx` e `apps/web/components/admin-disputes-dashboard.tsx`
  - validacao executada em `2026-03-30`: `pnpm.cmd --filter @bio-loop/web typecheck` PASS, `pnpm.cmd --filter @bio-loop/web test` PASS, `pnpm.cmd --filter @bio-loop/web build` PASS, `node apps/api/test/api-16.integration.test.mjs` PASS
  - build destravado apos ajuste de `Suspense` em `apps/web/app/login/page.tsx`
  - relatorio registrado em `docs/ops/done/WEB-15.done.md`
- status real: DONE

### INFRA-06 - CI split para gates rapidos e gates pesados
- descricao: pipeline separado em quick gate e heavy gate
- camada: infra
- dependencias: DB-05
- criterios de aceitacao:
  - gate rapido executa lint/typecheck/test
  - gate pesado executa drift/db verify/browser e2e
  - resultado documentado
- evidencia encontrada:
  - workflow em `.github/workflows/ci.yml`
  - `quick` executa install, `prisma:generate`, `lint`, `typecheck` e `test`
  - `heavy` depende de `quick` e executa `prisma:drift`, `db:verify-clean` e `test:e2e`
  - relatorio registrado em `docs/ops/done/INFRA-06.done.md`
- status real: DONE

### INFRA-07 - Runtime profile para piloto
- descricao: documentacao operacional do profile de piloto com dados reais
- camada: infra + docs
- dependencias: API-16, DATA-02
- criterios de aceitacao:
  - profile documentado
  - env/ports/comandos definidos
  - validacao operacional registrada
- evidencia encontrada:
  - documento em `docs/ops/PILOT_RUNTIME_PROFILE.md`
  - `.env.example`, `docker-compose.yml`, `docs/ops/DEVELOPER_QUICKSTART.md` e `docs/ops/LOCAL_RUNTIME_STACK.md` reconciliados para Postgres em `5453`
  - relatorio registrado em `docs/ops/done/INFRA-07.done.md`
- status real: DONE

### QA-06 - Browser e2e expandido para buyer real-data
- descricao: suite browser para buyer feed/detail/pickup com origem real de dados
- camada: qa
- dependencias: DB-04, API-16, WEB-14
- criterios de aceitacao:
  - fluxo buyer feed -> auction detail -> pickup detail coberto
  - prova de `source=api`
  - gate browser documentado
- evidencia encontrada:
  - teste em `tests/e2e/buyer-real-data.e2e.spec.ts`
  - gate browser executado com `pnpm.cmd exec playwright test tests/e2e/buyer-real-data.e2e.spec.ts`: PASS
  - ajuste necessario no redirect de login em `apps/web/components/login-panel.tsx` para o fluxo sair de `/login` no e2e real
  - relatorio registrado em `docs/ops/done/QA-06.done.md`
- status real: DONE

### WEB-16 - Pilot-ready dashboard handoff
- descricao: entrada unica para buyer/seller/admin com handoff mais executivo
- camada: web
- dependencias: WEB-14, WEB-15
- criterios de aceitacao:
  - uso recorrente por operador humano sem precisar conhecer rotas internas
  - handoff executivo coerente com o estado atual do produto
  - gates de frontend pertinentes executados
- evidencia encontrada:
  - home consolidada em `apps/web/app/page.tsx` com trilhas explicitas de buyer, seller e admin
  - smoke test atualizado em `apps/web/test/smoke.test.mjs`
  - estilos de handoff adicionados em `apps/web/app/globals.css`
  - validacao executada em `2026-03-30`: `pnpm.cmd --filter @bio-loop/web test` PASS, `pnpm.cmd --filter @bio-loop/web build` PASS, `pnpm.cmd --filter @bio-loop/web typecheck` PASS
  - relatorio registrado em `docs/ops/done/WEB-16.done.md`
- status real: DONE

### QA-07 - Pilot release checklist
- descricao: checklist consolidado para demonstracao/piloto com dados reais controlados
- camada: qa
- dependencias: API-17, WEB-16, INFRA-07
- criterios de aceitacao:
  - buyer, seller, admin, docs e import real passam checklist unico
  - checklist pode ser executado por operador humano sem improviso
  - evidencias finais de piloto ficam rastreaveis
- evidencia encontrada:
  - gate consolidado executado a partir de `docs/ops/POST_M7_RELEASE_GATE.md` e `docs/ops/PILOT_RUNTIME_PROFILE.md`
  - `pnpm.cmd typecheck` PASS
  - `pnpm.cmd --filter @bio-loop/web test` PASS
  - `pnpm.cmd --filter @bio-loop/api test` PASS
  - `pnpm.cmd test:e2e` PASS com 7/7 specs browser
  - spec `tests/e2e/buyer-real-data.e2e.spec.ts` endurecida para aguardar a navegacao de pickup detail antes das assertions
  - relatorio registrado em `docs/ops/done/QA-07.done.md`
- status real: DONE

### OPS-01 - Finalizar integridade pos-M9
- descricao: limpeza final da baseline documental e operacional depois do fechamento tecnico de M9
- camada: docs + orchestration
- dependencias: QA-07 concluida
- criterios de aceitacao:
  - `docs/ops/BACKLOG2.md` sem contradicoes materiais
  - `README.md` coerente com portas e runtime reconciliados
  - worktree limpo ou residuo restante classificado com justificativa
  - evidencia final registrada
- evidencia encontrada:
  - itens `DONE` reorganizados na secao correta deste arquivo
  - `M9 clean-up documental` removido de `FUTURO` e refletido como baseline fechada
  - `README.md` alinhado para `SHADOW_DATABASE_URL` em `5453`
  - alteracao cosmetica residual em `docs/agents/03_API_BACKEND.md` descartada por nao representar mudanca funcional nem decisao tecnica
  - relatorio registrado em `docs/ops/done/OPS-01.done.md`
- status real: DONE

## READY

## BLOCKED

## FUTURO

## Proxima task pequena escolhida

- nenhuma task escolhida
- a baseline pos-M9 esta limpa; qualquer proximo passo depende de aprovacao explicita do gatilho e de abertura de nova frente
