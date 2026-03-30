# STATUS1.md

Snapshot consolidado do projeto apos o fechamento de `M8`.

## Estado atual

- backlog anterior encerrado sem task `READY` restante
- runtime local previsivel para API, web, Postgres e Redis
- auth real funcionando com usuarios persistidos
- buyer principal consumindo API real com `source=api`
- pickup, seller reports e admin flows navegaveis para validacao manual
- `/reference` conectado a partir da UI operacional
- hygiene de Prisma/migrations adicionada ao CI com drift e banco limpo
- indices e selects criticos do buyer/admin/billing reforcados para reduzir overfetch e melhorar queries reais

## O que ja esta solido

### Plataforma

- monorepo pnpm+turborepo
- CI base com install, lint, typecheck, tests e browser e2e
- observabilidade minima com logs estruturados e health/readiness
- bootstrap automatico de `.env`
- separacao clara entre `API_PORT` e `WEB_PORT`

### Banco e dados

- schema central de trade, pickup, disputes, billing e auth
- migrations versionadas e validadas
- seed v2 idempotente orientado a cenarios
- persistencia real de invoices, fees e billing export
- pacote real dos supermercados da Suecia anexado e mapeado para onboarding controlado
- import controlado do pacote da Suecia validado em `dry-run` e `apply`, sem sobrescrever o seed demo

### API

- auth cookie-based com CSRF e refresh
- buyer feed e auction detail reais
- pickup schedule e POD
- buyer approval e dispute resolution
- seller reports e export
- OpenAPI + Scalar em `/reference`

### Web

- login por role com sessao persistida e refresh
- guards por role
- buyer feed, auction detail e pickup queue ligados a dados reais da API
- seller reports operacionais
- admin buyers e disputes operacionais
- estados de loading/error/empty padronizados
- UX conectada ao `/reference`
- seller lots, results e billing agora consomem o buyer feed real via o `AuctionStoreProvider` (WEB-14)
- admin buyers e disputes agora evidenciam catálogos demo x real com filtros `catalogScope` e badges de dataset (WEB-15)
- pipeline agora divide gates rápidos (lint/typecheck/test) e gates pesados (drift/db/e2e) para acelerar feedbacks (INFRA-06)

### QA e docs

- quickstart e runbooks locais atualizados
- gate pos-M7 consolidado
- Playwright real existente para buyer, seller e admin
- checklist manual de UAT documentado

## Pontos ainda em aberto

- nenhum item `READY` restante em `M9`; o proximo trabalho e reconciliacao documental dos snapshots historicos

## Riscos reais remanescentes

- a suite Playwright depende do ambiente permitir spawn/browser sem bloqueio local
- seller ainda depende mais de estado derivado local do que buyer/admin
- jobs precisam de locking e visibilidade melhores antes de exposicao menos assistida

## Onde estamos indo

A fase atual em curso e `M9 Production Hardening And Real Data Activation`, documentada em [BACKLOG1.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG1.md).

Objetivo dessa fase:

- endurecer banco e API para operacao mais confiavel
- ativar dados reais de forma controlada
- reduzir dependencia de surfaces derivadas/local state
- preparar um perfil de piloto com checklist unico

## Ultimo avancado

- `DATA-03` fechou a segmentacao operacional do catalogo misto com `catalogScope=demo|real|all`, default conservador em `demo` e docs para preservar QA manual/e2e
- `WEB-14` entregou superfícies de seller vinculadas ao fluxo real de lotes/resultados no buyer feed
- `WEB-15` esclareceu o contexto admin com filtros catalogScope e badges que destacam registros reais vs demo
- `INFRA-06` separou o CI em gate rápido (lint/typecheck/test) e gate pesado (drift + db verify + browser e2e) para feedbacks previsíveis
- `INFRA-07` documentou o perfil pilot (`docs/ops/PILOT_RUNTIME_PROFILE.md`) com as portas, o import real e as verificações necessárias

## Fechamento adicional de M9

- `QA-06` fechou o browser gate buyer real-data no fluxo feed -> auction -> pickup detail
- `WEB-16` consolidou o `/` como handoff executivo unico para buyer, seller e admin
- `QA-07` fechou o checklist consolidado do piloto com `typecheck`, testes de web/api e `test:e2e` verde

## Proxima task sugerida

- `M9 clean-up documental` em [BACKLOG2.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG2.md)
