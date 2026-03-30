# CONTEXT_SHARED

## Uso obrigatorio

Todo subagente que atuar depois de M9 deve ler este arquivo antes de propor ou executar qualquer tarefa.

## Estado global do projeto

- baseline pos-M9 limpa e validada
- trilha principal buyer / seller / admin funcional e com gates reais registrados
- ingestao de dados reais da Suecia validada
- profile operacional/piloto documentado
- browser gate consolidado fechado em `QA-07`
- nenhuma nova milestone deve ser aberta automaticamente

## Stack e restricoes que devem ser preservadas

- monorepo com `pnpm` + `turborepo`
- backend `Node.js` + `TypeScript` + `NestJS`
- `Prisma` + `PostgreSQL`
- jobs/fila com `BullMQ` + `Redis`
- auth com `JWT` + `RBAC`
- frontend `Next.js` + `TypeScript`
- contratos claros entre camadas
- validacao real antes de marcar `DONE`

## Fluxos ja validados que nao podem ser quebrados sem justificativa

- login real por role
- buyer feed / auction detail / pickup
- seller overview / lots / results / reports
- admin buyers / disputes
- ingestao real `dry-run` / `apply`
- `/reference`, `/health` e `/readiness`
- gate browser consolidado

## Fontes de verdade

1. `docs/ops/BACKLOG2.md` para o fechamento validado de M9
2. `docs/ops/done/*.done.md` para evidencia de gates fechados
3. `docs/ops/PILOT_RUNTIME_PROFILE.md` para runtime operacional
4. `docs/ops/M10.md` + `BACKLOG4/5/6` para a organizacao da continuidade

## Regras de trabalho

- nao executar no escuro
- nao promover `DONE` sem gate real
- nao promover `READY` com dependencia aberta
- nao misturar produto, hardening tecnico e UX na mesma task
- mapear impacto cruzado entre dominio, API, jobs, auth e frontend
- preferir tarefas pequenas, auditaveis e com contrato claro

## Riscos remanescentes conhecidos

- seller ainda depende mais de runtime compartilhado do que do isolamento arquitetural ideal
- jobs podem exigir observabilidade adicional antes de exposicao menos assistida
- validacoes Prisma no Windows podem sofrer lock ambiental
- browser/e2e dependem de ambiente local saudavel para Docker e spawn do navegador

## Leitura minima por frente

### Se atuar em `BACKLOG4`

- `docs/ops/PILOT_RUNTIME_PROFILE.md`
- `docs/ops/POST_M7_RELEASE_GATE.md`
- `docs/ops/BACKLOG4.md`

### Se atuar em `BACKLOG5`

- `docs/ops/BACKLOG5.md`
- `docs/ops/BACKLOG2.md`
- relatorios `done` relevantes do risco atacado

### Se atuar em `BACKLOG6`

- `docs/ops/BACKLOG6.md`
- `docs/ops/BACKLOG4.md`
- superficies reais do web que participam da jornada revisada

## Gate final para qualquer subagente

Antes de devolver uma task:

- informar o que foi feito
- listar arquivos alterados
- registrar decisoes tomadas
- apontar riscos encontrados
- informar testes executados
- registrar pendencias restantes
