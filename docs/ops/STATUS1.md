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

### QA e docs

- quickstart e runbooks locais atualizados
- gate pos-M7 consolidado
- Playwright real existente para buyer, seller e admin
- checklist manual de UAT documentado

## Pontos ainda em aberto

- `API-16`: pack de readiness de producao
- `DATA-02`: import controlado do dataset real da Suecia
- `WEB-14+`: seller/admin mais orientados a dados reais e piloto

## Riscos reais remanescentes

- a suite Playwright depende do ambiente permitir spawn/browser sem bloqueio local
- seller ainda depende mais de estado derivado local do que buyer/admin
- import real ainda nao foi ligado ao schema/runtime principal
- jobs precisam de locking e visibilidade melhores antes de exposicao menos assistida

## Onde estamos indo

A fase atual em curso e `M9 Production Hardening And Real Data Activation`, documentada em [BACKLOG1.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG1.md).

Objetivo dessa fase:

- endurecer banco e API para operacao mais confiavel
- ativar dados reais de forma controlada
- reduzir dependencia de surfaces derivadas/local state
- preparar um perfil de piloto com checklist unico

## Ultimo avancado

- `API-15` fechou locking basico de worker, retry por item, visibilidade operacional dos sweeps e degradacao refletida em `/health` e `/readiness`

## Proxima task sugerida

- `API-16` em [BACKLOG1.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG1.md)
