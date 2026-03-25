# BACKLOG1.md

Continuacao operacional do backlog apos o fechamento de `M8` em [BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md).

## Legenda

- READY: pode executar agora
- BLOCKED: depende de outra task
- DOING: em execucao
- DONE: concluido

## Regras desta fase

- O orquestrador continua escolhendo sempre a primeira task `READY`.
- O usuario continua sendo o gatilho manual de avancar task a task.
- Ao concluir cada task executada, o orquestrador deve gerar um commit proprio.
- Se a task tocar Prisma ou API dependente de Prisma, `pnpm.cmd --filter @bio-loop/api prisma:generate` continua obrigatorio antes do fechamento.
- O pacote de dados reais da Suecia continua sendo a base para a trilha de ingestao controlada.

---

## M9 Production Hardening And Real Data Activation

### Data / Database lane

- [DONE] (DB-04) Read models e indices para queries reais
  - owner: DB Agent
  - deps: DB-02, API-13
  - output: indices/read models para buyers, disputes, reports e buyer feed
  - gate: queries criticas com indice explicito e sem regressao nos endpoints principais

- [DONE] (DATA-02) Import controlado dos supermercados da Suecia
  - owner: DB Agent
  - deps: DB-04, API-16
  - output: import script/processo reprodutivel para stores, contacts, pickup windows, categories, buyers e lots iniciais
  - gate: pacote real entra sem sobrescrever seed de demo e com validacao de integridade

- [READY] (DATA-03) Catalogo operacional misto demo + real
  - owner: DB Agent
  - deps: DATA-02
  - output: estrategia clara para coexistencia entre dataset demo e dataset real controlado
  - gate: ambientes locais continuam navegaveis e o import real nao quebra QA manual/e2e

### Backend / API lane

- [DONE] (API-14) Idempotencia e auditoria para mutacoes criticas
  - owner: API Agent
  - deps: API-12, API-13
  - output: protecao contra replay/double-submit em bid, approval, dispute, pickup e POD
  - gate: repeticao nao gera efeito indevido; trilha de auditoria cobre actor, entidade e timestamp

- [DONE] (API-15) Jobs runtime hardening
  - owner: API Agent
  - deps: API-14, INFRA-03
  - output: locking basico, retry e visibilidade de `end_auction` e `no_show`
  - gate: scheduler nao duplica processamento e health/readiness distinguem degradacao de worker

- [DONE] (API-16) API production readiness pack
  - owner: API Agent
  - deps: API-13, API-15
  - output: paginacao, filtros, erros tipados e bootstrap/config seguro para exposicao menos assistida
  - gate: endpoints administrativos/listagens com shape consistente e `/reference` sem drift

- [READY] (API-17) Ingest API para dados reais
  - owner: API Agent
  - deps: DATA-02, API-16
  - output: ponto seguro para ingestao/importacao e reprocessamento controlado do dataset real
  - gate: import real executa com validacao, logging e rollback operacional claro

### Frontend / Web lane

- [READY] (WEB-14) Seller surfaces em dados reais da API
  - owner: Frontend Agent
  - deps: DB-04, API-16
  - output: seller lots/results menos dependentes do estado derivado local
  - gate: seller opera com dados reais ou read-model dedicado, sem ambiguidade de origem

- [READY] (WEB-15) Admin operational clarity for real data
  - owner: Frontend Agent
  - deps: API-16, DATA-02
  - output: labels, filtros e contexto melhores para buyers/disputes reais
  - gate: admin distingue claramente registros demo e reais quando coexistirem

- [BLOCKED] (WEB-16) Pilot-ready dashboard handoff
  - owner: Frontend Agent
  - deps: WEB-14, WEB-15
  - output: entrada unica para buyer/seller/admin com handoff mais executivo
  - gate: uso recorrente por operador humano sem precisar conhecer rotas internas

### Infra / QA support lane

- [READY] (INFRA-06) CI split para gates rapidos e gates pesados
  - owner: Infra Agent
  - deps: DB-05
  - output: pipeline separado entre typecheck/unit e gates de db/e2e mais pesados
  - gate: feedback rapido continua curto e gates pesados continuam obrigatorios antes de merge/release

- [READY] (INFRA-07) Runtime profile para piloto
  - owner: Infra Agent
  - deps: API-16, DATA-02
  - output: profile/env documentado para rodar stack com dados reais controlados
  - gate: ambiente de piloto sobe sem improviso de portas, env ou bootstrap

- [BLOCKED] (QA-06) Browser e2e expandido para buyer real-data
  - owner: QA Agent
  - deps: DB-04, API-16, WEB-14
  - output: suite cobrindo buyer feed/detail/pickup com dados reais e nao apenas seed de demo
  - gate: browser e2e prova origem real dos dados no caminho principal buyer

- [BLOCKED] (QA-07) Pilot release checklist
  - owner: QA Agent
  - deps: API-17, WEB-16, INFRA-07
  - output: checklist consolidado para demonstracao/piloto com dados reais controlados
  - gate: buyer, seller, admin, docs e import real passam checklist unico

---

## Ordem proposta

1. `DB-04`
2. `API-14`
3. `API-15`
4. `API-16`
5. `DATA-02`
6. `DATA-03`
7. `API-17`
8. `WEB-14`
9. `WEB-15`
10. `INFRA-06`
11. `INFRA-07`
12. `QA-06`
13. `WEB-16`
14. `QA-07`

## Proxima READY

- `DATA-03`
