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

### B6-07 - Alinhar estados compartilhados de loading / empty / error / success
- status proposto: DONE
- objetivo: aumentar a consistencia percebida entre buyer, seller, admin e pickup por meio do tratamento visual e textual dos estados compartilhados
- camada: ux + frontend
- dependencia-chave: conclusao da primeira rodada de slices `B6-04` a `B6-06`
- criterio adicional de fechamento:
  - relatorio registrado em `docs/ops/done/B6-07.done.md`
  - gates de `typecheck`, `test` e `build` do web fechados

### B6-08 - Design layer minimo reutilizavel
- status proposto: DONE
- objetivo: consolidar um pequeno layer reutilizavel a partir dos padroes visuais maduros ja validados em B6-04 a B6-09
- camada: ux + frontend
- dependencia-chave: conclusao de `B6-09` (DONE)
- criterio adicional de fechamento:
  - tokens e variaveis CSS compartilhadas extraidos e documentados
  - sem redesign amplo — apenas formalizacao do que ja existe
  - relatorio registrado em `docs/ops/done/B6-08.done.md`
  - gates de `typecheck`, `test` e `build` do web fechados
- motivo para entrada em READY:
  - gatilho aprovou abertura desta mini-fase em 2026-04-01

### B6-09 - Buyer detail + pickup continuity
- status proposto: DONE
- objetivo: reforcar a continuidade de experiencia entre buyer feed, auction detail e pickup sem abrir redesign amplo do fluxo inteiro
- camada: ux + frontend
- dependencia-chave: conclusao de `B6-07`
- criterio adicional de fechamento:
  - relatorio registrado em `docs/ops/done/B6-09.done.md`
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
- `B6-07` - Alinhar estados compartilhados de loading / empty / error / success
  - evidencia final: ajustes em `apps/web/components/workspace-state.tsx`, `apps/web/components/admin-buyers-dashboard.tsx`, `apps/web/components/admin-disputes-dashboard.tsx`, `apps/web/components/pickup-dashboard.tsx` e `apps/web/app/globals.css`
  - gate/evidencia: `docs/ops/done/B6-07.done.md`
- `B6-08` - Design layer minimo reutilizavel
  - evidencia final: bloco de documentacao `BIO-LOOP DESIGN LAYER` adicionado a `apps/web/app/globals.css`; tokens agrupados com semantica documentada; superficies, paletas de status/workspace e tipografia rastreadas
  - gate/evidencia: `docs/ops/done/B6-08.done.md`
- `B6-09` - Buyer detail + pickup continuity
  - evidencia final: ajustes em `apps/web/components/buyer-dashboard.tsx`, `apps/web/components/pickup-dashboard.tsx` e `apps/web/app/globals.css`
  - gate/evidencia: `docs/ops/done/B6-09.done.md`

## READY

- nenhuma task `READY` neste momento

## BLOCKED

- nenhuma task `BLOCKED` neste momento

## FUTURO

- redesigns por modulo e eventuais implementacoes guiadas por Figma, depois de B6-08 aprovado e fechado

## Proxima task pequena escolhida

- nenhuma task escolhida
- o ciclo completo de UX/Figma desta frente foi fechado com B6-08
- proxima passagem depende de nova decisao explicita do gatilho

## Observacao operacional

`BACKLOG6` foi aberta depois do fechamento operacional de `BACKLOG4`. `B6-01`, `B6-02` e `B6-03` fecharam o checkpoint formal de UX/Figma sem abrir redesign amplo nem tocar a base tecnica validada. `B6-04`, `B6-05` e `B6-06` fecharam a primeira rodada completa de slices em handoff/buyer, seller e admin. `B6-07` consolidou a linguagem compartilhada de loading, empty, error e success sem abrir design system amplo. `B6-09` reforcou a continuidade entre buyer detail e pickup sem transformar essa fase em redesign amplo ou design layer. `B6-08` formalizou o design layer minimo com documentacao inline de tokens, superficies e paletas sem alterar nenhum valor visual existente, encerrando o ciclo completo desta frente.
