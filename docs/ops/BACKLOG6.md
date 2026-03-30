# BACKLOG6 - UX / Figma / Experiencia

## Status da frente

DOCUMENTED-NEXT

## Estado operacional

- frente ativa principal: sim
- frente de origem da transicao: `BACKLOG4`
- leitura obrigatoria antes de executar: `docs/agents/CONTEXT_SHARED.md`

## Papel desta frente

Preparar o checkpoint de UX/Figma sobre uma base funcional ja validada, sem misturar essa revisao com refactor tecnico ou piloto em execucao.

## Hipotese de trabalho

O projeto ja atingiu um checkpoint inicial de Figma Ready para revisao de fluxo e experiencia, mas nao para redesign amplo sem foco.

## Checkpoint atual de Figma Ready

- checkpoint inicial atingido: sim
- modulos mais maduros para revisao: buyer, seller, admin e handoff principal no `/`
- modulos ainda com maior risco de retrabalho: areas dependentes de evolucao estrutural seller/runtime e qualquer UX que dependa de mudanca tecnica de `BACKLOG5`
- ordem recomendada de entrada no Figma:
  1. buyer / seller / admin como jornadas reais
  2. handoff principal e shell de navegacao
  3. refinamento de estados compartilhados (`loading`, `empty`, `error`, `success`)

## Regras de atencao

- UX deve partir dos fluxos reais buyer / seller / admin ja validados
- nao reabrir contratos de API por iniciativa de design
- nao usar esta frente para corrigir problemas tecnicos que pertencem a `BACKLOG5`
- priorizar clareza operacional, narrativa e friccao real observada

## Subagentes recomendados

- UX Agent
- Frontend Agent

Todos devem ler `docs/agents/CONTEXT_SHARED.md` antes da execucao.

## Candidatas registradas para fase seguinte

### B6-01 - Mapa de jornadas reais buyer / seller / admin
- status proposto: DONE
- objetivo: registrar a jornada atual como base para checkpoint de UX
- camada: ux + produto
- dependencia-chave: consolidacao da narrativa de demo/piloto em `BACKLOG4`
- criterio adicional de fechamento:
  - relatorio registrado em `docs/ops/done/B6-01.done.md`

### B6-02 - Inventario de friccoes e ambiguidades de interface
- status proposto: DONE
- objetivo: listar os pontos de confusao reais observados nos fluxos principais
- camada: ux + frontend
- dependencia-chave: resultado do uso guiado definido em `BACKLOG4`
- criterio adicional de fechamento:
  - inventario registrado em `docs/ops/UX_FRICTION_INVENTORY.md`
  - relatorio registrado em `docs/ops/done/B6-02.done.md`

### B6-03 - Criterio de Figma Ready formal
- status proposto: READY
- objetivo: declarar o que pode entrar em redesign e o que deve permanecer congelado
- camada: ux + orchestration
- dependencia-chave: B6-01 e B6-02
- motivo para entrar em READY:
  - as jornadas e as friccoes ja foram registradas e agora o checkpoint formal pode ser definido sem redesign ainda

## DONE

- `B6-01` - Mapa de jornadas reais buyer / seller / admin
  - evidencia final: `docs/ops/UX_JOURNEY_MAP.md`
  - gate/evidencia: `docs/ops/done/B6-01.done.md`
- `B6-02` - Inventario de friccoes e ambiguidades de interface
  - evidencia final: `docs/ops/UX_FRICTION_INVENTORY.md`
  - gate/evidencia: `docs/ops/done/B6-02.done.md`

## READY

- `B6-03` - Criterio de Figma Ready formal
  - motivo explicito: a jornada atual e as friccoes principais ja foram registradas sem abrir redesign

## BLOCKED

- nenhuma task `BLOCKED` neste momento

## FUTURO

- redesigns por modulo e eventuais implementacoes guiadas por Figma, depois do checkpoint formal

## Proxima task pequena escolhida

- `B6-03`
- objetivo: declarar o que pode entrar em redesign e o que deve permanecer congelado
- camada: ux + orchestration
- aceitacao:
  - modulos maduros e modulos sensiveis classificados
  - ordem recomendada de entrada no Figma declarada
  - sem abrir redesign nem implementacao visual ainda

## Observacao operacional

`BACKLOG6` foi aberta depois do fechamento operacional de `BACKLOG4`. A frente segue em modo de leitura estruturada de experiencia e checkpoint, ainda sem redesign amplo.
