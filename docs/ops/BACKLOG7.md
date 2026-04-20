# BACKLOG7 - Crescimento de Produto / Portfolio / Marketplace Story

## Status da frente

DOCUMENTED-FUTURE

## Estado operacional

- frente ativa principal: nao
- frente criada para documentar continuidade estrategica
- `READY` ativa: nao
- dependencias principais: auth browser funcional em producao, demo pos-auth validada e decisao explicita do gatilho

## Papel desta frente

Evoluir o Bio Loop como produto demonstravel de portfolio, mostrando logica de marketplace, estados complexos, operacao B2B vertical, metricas, documentacao e visao de negocio.

Esta frente nao existe para criar "mais telas" no vazio. Ela existe para fortalecer a narrativa de produto real depois que a base tecnica de producao estiver utilizavel no browser.

## Nao entra nesta frente

- corrigir auth
- resolver dominio/cookie
- refatorar API
- redesign amplo sem evidencia
- criar telas decorativas sem estado real
- abrir mobile/app separado
- trocar arquitetura por impulso

## Premissas

- deploy base esta DONE
- CORS esta validado para a Web da Vercel
- auth browser ainda esta BLOCKED por cookie CSRF cross-site
- UX layer inicial ja existe
- produto ja possui buyer, seller, admin, pickup, billing, disputes e dados reais controlados
- proximo crescimento deve provar produto e negocio, nao apenas interface

## Ordem recomendada antes desta frente

1. `B5-04 - Auth production cookie/domain decision`
2. `DEPLOY-02 - Same-site domain setup for production auth`
3. `QA-08 - Browser auth production validation`
4. `B4-18 - Demo assistida pos-auth em producao`
5. Decisao explicita do gatilho para abrir `BACKLOG7`

## Candidatas futuras

### B7-01 - Marketplace lifecycle story map
- status proposto: CANDIDATA
- objetivo: documentar o ciclo completo do marketplace como narrativa de produto: lot -> auction -> bid -> order -> pickup -> invoice
- camada: produto + docs + dominio
- criterios de aceitacao:
  - estados principais listados por entidade
  - transicoes explicadas em linguagem de negocio
  - buyer, seller e admin conectados no mesmo fluxo
  - gaps reais separados de oportunidades futuras
  - nenhuma implementacao automatica
- evidencia esperada:
  - `docs/ops/MARKETPLACE_LIFECYCLE_STORY.md`

### B7-02 - Business metrics layer plan
- status proposto: CANDIDATA
- objetivo: definir as metricas que tornam o produto forte como portfolio B2B e marketplace operacional
- camada: produto + dados + analytics
- metricas candidatas:
  - food waste avoided
  - estimated CO2 saved
  - recovery value
  - sell-through rate
  - no-show rate
  - average bid delta
  - buyer participation
  - dispute rate
- criterios de aceitacao:
  - metricas definidas com formula, fonte de dados e limitacoes
  - separar metricas calculaveis agora de metricas futuras
  - nao inventar numeros sem base
  - nao alterar schema sem task tecnica posterior
- evidencia esperada:
  - `docs/ops/BUSINESS_METRICS_PLAN.md`

### B7-03 - Portfolio narrative and README upgrade plan
- status proposto: CANDIDATA
- objetivo: transformar o projeto em uma narrativa clara de portfolio tecnico/produto sem exagerar capacidades ainda nao validadas
- camada: docs + produto + carreira
- criterios de aceitacao:
  - proposta de valor explicada em ate poucos paragrafos
  - arquitetura resumida com tradeoffs
  - fluxo demo documentado
  - screenshots ou evidencias futuras listadas como pendencia, nao inventadas
  - proxima evolucao tecnica registrada com honestidade
- evidencia esperada:
  - plano de atualizacao do `README.md`
  - checklist de portfolio em `docs/ops/PORTFOLIO_NARRATIVE_PLAN.md`

### B7-04 - Operations dashboard depth plan
- status proposto: CANDIDATA
- objetivo: planejar evolucoes de dashboard que mostrem operacao real sem criar UI decorativa
- camada: produto + ux + frontend
- escopo candidato:
  - seller: valor recuperado, lotes ativos, performance de leiloes
  - buyer: oportunidades, historico de bids, pickups pendentes
  - admin: risco, disputas, buyers pendentes, visao geral da operacao
- dependencia-chave:
  - `B7-01` e `B7-02`
- fora de escopo:
  - implementacao imediata
  - redesign amplo
  - mudanca de contrato API sem task propria

### B7-05 - Demo evidence pack for portfolio
- status proposto: CANDIDATA
- objetivo: consolidar evidencias de produto demonstravel para entrevista, README e apresentacao
- camada: docs + qa + produto
- dependencia-chave:
  - auth browser funcional
  - demo pos-auth executada
  - lifecycle e metricas documentadas
- criterios de aceitacao:
  - roteiro de demo curto
  - lista de evidencias reais
  - limitacoes conhecidas
  - proximos passos claros
  - sem claims nao validados

## READY

- nenhuma task `READY` neste momento

## BLOCKED

- `B7-01`
  - motivo: depende de auth browser funcional ou decisao explicita de documentar mesmo antes da demo pos-auth
- `B7-02`
  - motivo: depende de lifecycle acordado e decisao sobre quais metricas serao tratadas como produto
- `B7-03`
  - motivo: depende de decidir se o README sera reposicionado para portfolio agora ou depois da demo pos-auth
- `B7-04`
  - motivo: depende de lifecycle/metricas e deve evitar UI decorativa
- `B7-05`
  - motivo: depende de evidencias reais pos-auth

## FUTURO

- abrir esta frente somente apos o bloqueio de auth em producao ser resolvido ou mediante gatilho explicito para documentacao estrategica
- transformar o Bio Loop em showcase de produto B2B vertical, nao apenas app visual
- priorizar logica de marketplace, estados, metricas, operacao e narrativa de negocio

## Proxima task pequena escolhida

- nenhuma task escolhida
- nao ha task `READY` neste momento
- proxima passagem depende de novo gatilho explicito

## Observacao operacional

O crescimento de portfolio deve vir depois do acesso real em producao. A sequencia recomendada e desbloquear auth, validar browser, demonstrar o fluxo e so entao aprofundar marketplace story, metricas e UX orientada por evidencia.
