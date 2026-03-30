# BACKLOG6 - UX / Figma / Experiencia

## Status da frente

DOCUMENTED-NEXT

## Estado operacional

- frente ativa principal: nao
- prioridade relativa: imediatamente seguinte a `BACKLOG4`
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
- status proposto: CANDIDATA-NEXT
- objetivo: registrar a jornada atual como base para checkpoint de UX
- camada: ux + produto
- dependencia-chave: consolidacao da narrativa de demo/piloto em `BACKLOG4`

### B6-02 - Inventario de friccoes e ambiguidades de interface
- status proposto: CANDIDATA-NEXT
- objetivo: listar os pontos de confusao reais observados nos fluxos principais
- camada: ux + frontend
- dependencia-chave: resultado do uso guiado definido em `BACKLOG4`

### B6-03 - Criterio de Figma Ready formal
- status proposto: CANDIDATA-NEXT
- objetivo: declarar o que pode entrar em redesign e o que deve permanecer congelado
- camada: ux + orchestration
- dependencia-chave: B6-01 e B6-02

## DONE

- nenhuma task executada ainda nesta frente

## READY

- nenhuma task `READY`

## BLOCKED

- `B6-01`
  - motivo explicito: depende da consolidacao da narrativa operacional principal em `BACKLOG4`
- `B6-02`
  - motivo explicito: depende de uso guiado ou roteiro aprovado em `BACKLOG4`
- `B6-03`
  - motivo explicito: depende da conclusao de `B6-01` e `B6-02`

## FUTURO

- redesigns por modulo e eventuais implementacoes guiadas por Figma, depois do checkpoint formal

## Proxima task pequena escolhida

- nenhuma task escolhida
- esta frente so deve abrir depois da primeira rodada controlada de `BACKLOG4`

## Observacao operacional

`BACKLOG6` e a frente imediatamente seguinte, mas nao deve ser executada enquanto `BACKLOG4` estiver em definicao inicial.
