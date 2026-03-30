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
- status proposto: DONE
- objetivo: declarar o que pode entrar em redesign e o que deve permanecer congelado
- camada: ux + orchestration
- dependencia-chave: B6-01 e B6-02
- criterio adicional de fechamento:
  - checkpoint registrado em `docs/ops/FIGMA_READY_CHECKPOINT.md`
  - relatorio registrado em `docs/ops/done/B6-03.done.md`

### B6-04 - Refinar handoff principal e buyer shell como primeiro slice de UX/Figma
- status proposto: DONE
- objetivo: refinar hierarquia, narrativa e consistencia visual do handoff principal, login e buyer shell sem alterar comportamento funcional
- camada: ux + frontend
- dependencia-chave: checkpoint formal de `Figma Ready` e aprovacao do gatilho
- criterio adicional de fechamento:
  - relatorio registrado em `docs/ops/done/B6-04.done.md`
  - gates de `typecheck`, `test` e `build` do web fechados

### B6-05 - Refinar seller overview como segundo slice de UX/Figma
- status proposto: DONE
- objetivo: elevar hierarquia visual e leitura de valor do seller overview sem tocar resultados, reports ou admin
- camada: ux + frontend
- dependencia-chave: conclusao de `B6-04`
- criterio adicional de fechamento:
  - relatorio registrado em `docs/ops/done/B6-05.done.md`
  - gates de `typecheck`, `test` e `build` do web fechados

### B6-06 - Refinar admin closeout como terceiro slice de UX/Figma
- status proposto: DONE
- objetivo: melhorar a narrativa de fechamento e governanca do admin sem redesign amplo
- camada: ux + frontend
- dependencia-chave: conclusao de `B6-05`
- criterio adicional de fechamento:
  - relatorio registrado em `docs/ops/done/B6-06.done.md`
  - gates de `typecheck`, `test` e `build` do web fechados

## DONE

- `B6-01` - Mapa de jornadas reais buyer / seller / admin
  - evidencia final: `docs/ops/UX_JOURNEY_MAP.md`
  - gate/evidencia: `docs/ops/done/B6-01.done.md`
- `B6-02` - Inventario de friccoes e ambiguidades de interface
  - evidencia final: `docs/ops/UX_FRICTION_INVENTORY.md`
  - gate/evidencia: `docs/ops/done/B6-02.done.md`
- `B6-03` - Criterio de Figma Ready formal
  - evidencia final: `docs/ops/FIGMA_READY_CHECKPOINT.md`
  - gate/evidencia: `docs/ops/done/B6-03.done.md`
- `B6-04` - Refinar handoff principal e buyer shell como primeiro slice de UX/Figma
  - evidencia final: ajustes em `apps/web/app/page.tsx`, `apps/web/components/login-panel.tsx`, `apps/web/components/buyer-dashboard.tsx` e `apps/web/app/globals.css`
  - gate/evidencia: `docs/ops/done/B6-04.done.md`
- `B6-05` - Refinar seller overview como segundo slice de UX/Figma
  - evidencia final: ajustes em `apps/web/app/seller/page.tsx`, `apps/web/components/seller-dashboard.tsx` e `apps/web/app/globals.css`
  - gate/evidencia: `docs/ops/done/B6-05.done.md`
- `B6-06` - Refinar admin closeout como terceiro slice de UX/Figma
  - evidencia final: ajustes em `apps/web/app/admin/page.tsx` e `apps/web/app/globals.css`
  - gate/evidencia: `docs/ops/done/B6-06.done.md`

## READY

- nenhuma task `READY` neste momento

## BLOCKED

- nenhuma task `BLOCKED` neste momento

## FUTURO

- redesigns por modulo e eventuais implementacoes guiadas por Figma, depois da aprovacao do gatilho sobre a proxima mini-fase

## Proxima task pequena escolhida

- nenhuma task escolhida
- a proxima mini-fase desta frente depende de nova decisao do gatilho

## Observacao operacional

`BACKLOG6` foi aberta depois do fechamento operacional de `BACKLOG4`. `B6-01`, `B6-02` e `B6-03` fecharam o checkpoint formal de UX/Figma sem abrir redesign amplo nem tocar a base tecnica validada. `B6-04`, `B6-05` e `B6-06` fecharam a primeira rodada completa de slices em handoff/buyer, seller e admin.
