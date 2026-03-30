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

## PARTIAL

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
  - sem relatorio `done` dedicado
  - sem teste dedicado identificado no repo para esse fechamento especifico
- status real: PARTIAL

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
  - sem relatorio `done` dedicado
- status real: PARTIAL

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
  - sem relatorio `done` dedicado
- status real: PARTIAL

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
  - `STATUS.md` afirma fechado, mas `STATUS1.md` afirma que ainda e a proxima task sugerida
  - sem relatorio `done` dedicado
- status real: PARTIAL

## READY

### VAL-INFRA-06 - Validar e fechar o split de CI
- descricao: confirmar que o workflow rapido/pesado atual corresponde ao gate pretendido e registrar o fechamento
- camada: infra
- dependencias: DB-05
- criterios de aceitacao:
  - workflow revisado sem drift documental
  - gates rapido/pesado descritos no backlog/status
  - relatorio `done` e backlog atualizados
- status real: READY

### VAL-WEB-14 - Validar e fechar WEB-14
- descricao: reexecutar gate real das surfaces seller em dados reais e registrar evidencia de fechamento
- camada: web
- dependencias: DB-04, API-16
- criterios de aceitacao:
  - seller lots/results usam dados reais sem ambiguidade de origem
  - gates de frontend e integracao pertinentes executados
  - relatorio `done` criado
- status real: READY

## BLOCKED

### QA-06 - Fechamento final bloqueado
- motivo explicito: depende de `API-16` e `WEB-14` validadas; hoje existe spec de Playwright, mas o gate final permanece sem evidencia consistente e a documentacao esta contraditoria
- status real: BLOCKED

### WEB-16 - Pilot-ready dashboard handoff
- motivo explicito: depende do fechamento real de `WEB-14` e `WEB-15`; o backlog anterior marcou `BLOCKED` sem explicitar isso corretamente
- status real: BLOCKED

### QA-07 - Pilot release checklist
- motivo explicito: depende de `WEB-16` concluida e de `INFRA-07` fechada; o checklist unico de piloto ainda nao tem base final estavel
- status real: BLOCKED

## FUTURO

### M9 clean-up documental
- descricao: reconciliar `STATUS.md`, `STATUS1.md`, `BACKLOG.md` e `BACKLOG1.md` depois que os itens parciais forem validados ou rebaixados definitivamente
- camada: docs + orchestration
- dependencias: fechamento dos itens `VAL-*`
- status real: FUTURO

## Proxima task pequena escolhida

### VAL-INFRA-06
- objetivo: confirmar o fechamento real do split de CI rapido/pesado ja implementado, sem abrir novo escopo
- camada: infra
- dependencias: DB-05
- aceitacao:
  - gate tecnico executado
  - evidencias registradas
  - `INFRA-06` promovida para `DONE` ou rebaixada com motivo explicito
