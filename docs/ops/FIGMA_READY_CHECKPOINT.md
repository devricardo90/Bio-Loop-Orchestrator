# Figma Ready Checkpoint

## Status

FORMALIZED

## Objetivo

Declarar, de forma rastreavel, quais modulos da baseline atual ja podem entrar em revisao de Figma/UX e quais devem permanecer congelados ate existir necessidade ou decisao tecnica mais clara.

## Base usada

- `docs/ops/UX_JOURNEY_MAP.md`
- `docs/ops/UX_FRICTION_INVENTORY.md`
- `docs/ops/BACKLOG4.md`
- `docs/ops/BACKLOG6.md`

## Leitura executiva

O projeto atingiu `Figma Ready` para checkpoint de fluxo, hierarquia, narrativa e experiencia nas superficies principais buyer, seller, admin e handoff principal.

O projeto ainda nao atingiu `Figma Ready` para redesign amplo de tudo ao mesmo tempo.

## Modulos prontos para revisao de Figma

### Grupo 1 - Alta prioridade

- handoff principal em `/`
- jornada buyer:
  - `/buyer/feed`
  - `/buyer/auctions/[id]`
  - `/buyer/orders`
  - `/buyer/orders/[id]`

### Grupo 2 - Prioridade seguinte

- jornada seller:
  - `/seller`
  - `/seller/lots`
  - `/seller/lots/[id]`
  - `/seller/results`
  - `/seller/reports`

### Grupo 3 - Fechamento de narrativa

- jornada admin:
  - `/admin`
  - `/admin/buyers`
  - `/admin/disputes`

## Modulos que devem permanecer congelados

- qualquer UX que dependa de refactor de runtime seller/admin
- qualquer experiencia que exija mudanca estrutural de jobs, worker ou observability
- qualquer redesign que pressuponha mudanca de contrato API
- qualquer revisao ampla de estados compartilhados antes de consolidar os modulos principais

## Motivos para esta classificacao

### Modulos maduros

- possuem jornadas reais mapeadas
- ja passaram por baseline operacional de demo
- nao dependem de mudanca contratual imediata para ganhar clareza

### Modulos sensiveis

- ainda podem ser afetados por decisoes futuras de `BACKLOG5`
- teriam risco maior de retrabalho se recebessem redesign antes de priorizacao tecnica

## Ordem recomendada de entrada no Figma

1. handoff principal e buyer
2. seller
3. admin
4. shell comum e refinamento de estados compartilhados

## Tipo de trabalho permitido a partir deste checkpoint

- revisao de narrativa e orientacao
- melhoria de hierarquia de informacao
- clarificacao de CTA e contexto
- alinhamento visual entre telas maduras

## Tipo de trabalho que ainda nao deve comecar

- redesign amplo de toda a aplicacao
- implementacao visual em massa sem prioridade por modulo
- mudancas que alterem comportamento funcional validado
- qualquer acao que desvie para `BACKLOG5`

## Risco estimado de retrabalho

- handoff principal: baixo
- buyer: baixo a moderado
- seller: moderado
- admin: moderado
- estados compartilhados amplos: moderado a alto

## Conclusao

O checkpoint formal permite abrir a proxima etapa de UX/Figma com escopo controlado, priorizando as superficies mais maduras e protegendo o projeto contra redesign prematuro.
