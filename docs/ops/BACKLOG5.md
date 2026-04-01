# BACKLOG5 - Hardening Tecnico / Arquitetura

## Status da frente

ACTIVE-EXECUTION

## Estado operacional

- frente ativa principal: sim
- frente em execucao: sim
- leitura obrigatoria antes de executar: `docs/agents/CONTEXT_SHARED.md`

## Papel desta frente

Registrar os riscos tecnicos remanescentes e as opcoes de evolucao estrutural sem abri-las por impulso arquitetural.

## Esta frente so deve abrir se

- houver risco observado em piloto/demo/gates
- o problema estiver descrito com impacto verificavel
- a mudanca tiver fronteira pequena o suficiente para ser auditavel

## Riscos tecnicos atualmente conhecidos

- seller ainda depende de runtime compartilhado em vez de read-model mais isolado
- jobs/worker ainda podem exigir observabilidade adicional antes de exposicao menos assistida
- Prisma no Windows mostrou sensibilidade ambiental em `prisma:generate`
- browser/e2e dependem de ambiente local saudavel para Docker e spawn do navegador

## Subagentes recomendados

- API Agent
- Infra Agent
- DB Agent

Todos devem ler `docs/agents/CONTEXT_SHARED.md` antes da execucao.

## Candidatas registradas, mas nao priorizadas

### B5-01 - Isolamento progressivo do runtime seller
- status proposto: NAO PRIORIZADA
- objetivo: reduzir dependencia do seller em estado compartilhado do buyer
- camada: web + api
- dependencia-chave: decisao arquitetural explicita sobre endpoint/read-model seller

### B5-02 - Observabilidade operacional adicional de jobs
- status proposto: NAO PRIORIZADA
- objetivo: tornar degradacao de worker/scheduler mais rastreavel
- camada: api + infra
- dependencia-chave: contrato explicito de health/readiness/telemetria operacional

### B5-03 - Estabilidade ambiental de Prisma/e2e no Windows
- status proposto: NAO PRIORIZADA
- objetivo: reduzir friccao de validacao local
- camada: infra + docs
- dependencia-chave: decidir se o problema sera tratado como tooling local ou padrao oficial de execucao

## DONE

- nenhuma task executada nesta frente dentro de M10

## READY

- `B5-HOTFIX-01` - Estabilizar boot inicial, auth hydration, integridade de datas e coerência de estado visível

## BLOCKED

- `B5-01`
  - motivo explicito: depende de decisao arquitetural explicita sobre a estrategia de read-model seller
- `B5-02`
  - motivo explicito: depende de contrato definido para health/readiness/telemetria operacional
- `B5-03`
  - motivo explicito: depende de decidir se a friccao local sera tratada como politica oficial ou apenas runbook de ambiente

## FUTURO

- demais hardenings estruturais guiados por risco observado em piloto, demo ou gates reais

## Proxima task pequena escolhida

- `B5-HOTFIX-01` - Estabilizar boot inicial, auth hydration, integridade de datas e coerência de estado visível

## Observacao operacional

Esta frente foi reativada no pos-M9 devido aos vazamentos técnicos percebidos na rodada 2 do Piloto (B4-07). O hardening ataca cirurgicamente os ruidos estéticos de API/React mapeados sem escalar para reescritas gerais de runtime.
