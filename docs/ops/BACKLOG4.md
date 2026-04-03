# BACKLOG4 - Piloto / Produto / Operacao

## Status da frente

ACTIVE-PLANNING

## Estado operacional

- frente ativa principal: sim
- frentes concorrentes permitidas: nao
- leitura obrigatoria antes de executar: `docs/agents/CONTEXT_SHARED.md`

## Papel desta frente

Transformar a baseline validada ate M9 em uma experiencia de piloto/demo operacional clara, guiada e verificavel, sem abrir redesign amplo nem refactor estrutural.

## Nao entra nesta frente

- redesign direto
- refactor estrutural seller/jobs
- hardening tecnico por iniciativa propria sem risco observado

## Regras de atencao

- preservar os fluxos reais buyer / seller / admin ja validados
- nao quebrar gates de browser ja fechados em `QA-07`
- nao reabrir debate arquitetural dentro desta frente
- tratar copy, narrativa operacional e checklist como produto operacional, nao como cosmetica solta
- qualquer melhoria de UX profunda deve ser capturada e direcionada depois para `BACKLOG6`

## Subagentes recomendados

- Product/Ops Agent
- Frontend Agent
- QA Agent

Todos devem ler `docs/agents/CONTEXT_SHARED.md` antes da execucao.

## Estado atual

- baseline pos-M9 limpa
- piloto/runtime profile documentado
- browser gate consolidado validado
- handoff executivo inicial no `/`
- rodada corretiva de UX consolidada em `BACKLOG6`
- baseline revalidada em `B4-08`
- frente aprovada pelo gatilho para nova leitura orientada a decisao
- prioridade de produto consolidada em onboarding real controlado apos `B4-10`

## Itens concluidos que esta frente deve preservar

- `API-17`
- `DATA-02`
- `DATA-03`
- `WEB-14`
- `WEB-15`
- `WEB-16`
- `INFRA-07`
- `QA-07`

## Candidatas a primeiras tasks pequenas

### B4-01 - Demo script operacional por role
- status proposto: DONE
- objetivo: documentar o roteiro minimo de demonstracao para buyer, seller e admin sobre a baseline atual
- camada: docs + produto/operacao
- dependencias: M9 fechada, `INFRA-07`, `WEB-16`, `QA-07`
- criterios de aceitacao:
  - roteiro curto por role com inicio, verificacoes-chave e resultado esperado
  - comandos e URLs coerentes com o runtime atual
  - sem contradicao com `PILOT_RUNTIME_PROFILE.md`
- motivo para entrar em READY:
  - e a menor task que organiza a narrativa operacional sem tocar arquitetura nem UX profunda
  - destrava `B4-02` e reduz risco de retrabalho em `B4-03`
  - relatorio registrado em `docs/ops/done/B4-01.done.md`

### B4-02 - Checklist enxuto de readiness para demonstracao assistida
- status proposto: DONE
- objetivo: reduzir improviso imediatamente antes de uma demo/piloto manual
- camada: qa + docs + operacao
- dependencias: B4-01 ou escopo equivalente aprovado
- criterios de aceitacao:
  - preflight curto de ambiente, auth, dataset e links principais
  - checklist executavel por operador humano em poucos minutos
  - referencia explicita a `/health`, `/readiness`, `/reference` e UI principal
- motivo para entrar em READY:
  - `B4-01` fechou o roteiro operacional minimo e agora o checklist pode derivar de um script aprovado
  - relatorio registrado em `docs/ops/done/B4-02.done.md`

### B4-03 - Copy e narrativa operacional do handoff principal
- status proposto: DONE
- objetivo: ajustar a mensagem do `/` e dos pontos principais da demo para reduzir friccao na apresentacao
- camada: web + produto
- dependencias: B4-01 aprovado para evitar retrabalho de mensagem
- criterios de aceitacao:
  - copy alinhada ao roteiro aprovado
  - nenhuma regressao em build/test do web
  - sem abrir redesign amplo
- motivo para entrar em READY:
  - `B4-01` e `B4-02` consolidaram narrativa e preflight, reduzindo risco de retrabalho de copy
  - relatorio registrado em `docs/ops/done/B4-03.done.md`

### B4-04 - Dry-run assistido da demo com finding log
- status proposto: DONE
- objetivo: executar um ensaio controlado da demo e registrar friccoes reais antes de ampliar a frente
- camada: qa + produto/operacao
- dependencias: `B4-01`, `B4-02`, `B4-03`
- criterios de aceitacao:
  - ensaio registrado com evidencias rastreaveis
  - achados objetivos registrados
  - nenhum blocker silencioso deixado sem classificacao
- motivo para entrar em READY:
  - usa a narrativa e o checklist ja consolidados para validar a frente com uso quase real
  - relatorio registrado em `docs/ops/done/B4-04.done.md`

### B4-05 - Operator handoff card de 1 pagina
- status proposto: DONE
- objetivo: condensar roteiro e checklist em um artefato unico e ultra-curto para uso ao vivo
- camada: docs + produto/operacao
- dependencias: `B4-04`
- criterios de aceitacao:
  - artefato de uma pagina ou equivalente curto
  - buyer, seller, admin, links e preflight em formato de consulta rapida
  - sem contradicao com `PILOT_DEMO_SCRIPT.md` e `PILOT_DEMO_READINESS_CHECKLIST.md`
- motivo para entrar em READY:
  - `B4-04` fechou o ensaio e estabilizou a leitura pratica do roteiro
  - relatorio registrado em `docs/ops/done/B4-05.done.md`

### B4-06 - Ajustes cirurgicos de fluxo a partir do ensaio
- status proposto: BLOCKED
- objetivo: corrigir apenas friccoes concretas observadas no dry-run, sem expandir escopo
- camada: web + qa + produto
- dependencias: achados relevantes em `B4-04`
- criterios de aceitacao:
  - cada ajuste responde a finding real documentado
  - gates pertinentes executados
  - sem abrir redesign nem refactor estrutural
- motivo para bloqueio:
  - o dry-run atual nao deixou friccao funcional aberta que justifique execucao imediata

### B4-07 - Consolidar rodada 2 de piloto assistido com captura estruturada de sinais
- status proposto: DONE
- objetivo: usar o estado atual validado do produto para observar uso real e transformar sinais coletados em base de decisao
- camada: produto/operacao + qa + ux
- dependencias: baseline pos-M9 fechada
- criterios de aceitacao:
  - roteiro de Piloto executado na integra
  - evidencias listadas e agrupadas (OPERACAO, UX, TECNICA)
  - zero correcoes de codigo no processo
  - recomendacao final indicando BACKLOG4, 5 ou 6
- motivo para entrar em READY:
  - projeto validado precisa de uso funcional para decidir proximos passos, sem otimizar no vacuo

### B4-09 - Executar piloto orientado a decisao e classificar sinais
- status proposto: DONE
- objetivo: usar a baseline atual consolidada para observar uma rodada curta de uso assistido e converter os sinais em decisao objetiva de prioridade
- camada: produto/operacao + qa
- dependencias: `B4-08` concluida; baseline atual aceita pelo gatilho; zero correcoes abertas durante a task
- escopo:
  - executar a jornada assistida sobre a baseline atual sem tocar codigo
  - observar buyer, seller e admin na narrativa operacional principal
  - classificar sinais em `PRODUTO`, `UX` e `TECNICA`
  - devolver uma unica recomendacao final entre `BACKLOG4`, `BACKLOG6` ou `BACKLOG5`
- sinais a observar:
  - clareza de proposta de valor e narrativa buyer / seller / admin
  - atrito perceptivo relevante ou dependencia de explicacao verbal excessiva
  - bugs visiveis, inconsistencias de estado ou sinais de baixa confianca operacional
- criterios de aceitacao:
  - jornada executada e registrada sem correcoes automaticas
  - evidencias agrupadas por categoria com impacto e severidade
  - artefato unico, curto, observavel e auditavel
  - decisao final objetiva entre `BACKLOG4`, `BACKLOG6` ou `BACKLOG5`
- motivo para entrar em READY:
  - `B4-07` apontou gaps que levaram ao ciclo corretivo de `BACKLOG6`
  - `B4-08` registrou baseline mais estavel e pronta para nova leitura
  - o proximo ganho vem de decisao orientada por evidencia, nao de polish cego

### B4-10 - Definir prioridade unica de produto para a continuidade do piloto
- status proposto: DONE
- objetivo: converter a decisao de continuidade em `BACKLOG4` em uma prioridade unica e rastreavel de produto
- camada: produto/operacao
- dependencias: `B4-09` concluida
- criterios de aceitacao:
  - prioridade unica explicitada
  - frentes nao prioritarias explicitamente excluidas
  - recomendacao coerente com o estado real do repo e com a baseline atual
  - artefato curto e auditavel registrado
- motivo para entrar em READY:
  - `B4-09` decidiu manter `BACKLOG4`, mas a frente ainda precisava de uma direcao concreta para nao cair em expansao difusa

### B4-11 - Preparar prova operacional de onboarding real controlado
- status proposto: DONE
- objetivo: registrar o recorte, o checklist e a validacao minima do onboarding real controlado usando o dataset atual do piloto
- camada: produto/operacao + qa
- dependencias: `B4-10` concluida; pacote real oficial presente em `data/real-data/sweden-supermarkets/incoming/`
- criterios de aceitacao:
  - `dry-run` oficial executado com sucesso
  - recorte do dataset explicitado
  - checklist operacional minimo registrado
  - riscos e assuncoes ainda abertas listados sem abrir correcao automatica
- motivo para entrar em READY:
  - a prioridade definida em `B4-10` precisava virar uma prova operacional observavel antes de qualquer onboarding efetivo no piloto

### B4-12 - Preparar apply controlado do onboarding real no piloto
- status proposto: DONE
- objetivo: deixar a execucao efetiva do onboarding real pronta para autorizacao, com go/no-go e verificacao pos-apply
- camada: produto/operacao + qa
- dependencias: `B4-11` concluida
- criterios de aceitacao:
  - caminhos de apply explicitados
  - gate go/no-go registrado
  - verificacoes pos-apply listadas
  - nenhum apply executado dentro desta task
- motivo para entrar em READY:
  - depois da prova minima de `B4-11`, faltava apenas preparar a execucao controlada sem ainda alterar o estado do piloto

### B4-13 - Executar onboarding real controlado no piloto
- status proposto: DONE
- objetivo: aplicar o dataset real atual no ambiente do piloto e registrar o resultado da importacao
- camada: produto/operacao + qa
- dependencias: `B4-12` concluida; infra local disponivel
- criterios de aceitacao:
  - `db:import-real` executado com sucesso
  - resumo final da importacao registrado
  - nenhuma sobrescrita do dataset demo
  - qualquer pendencia residual separada de forma explicita
- motivo para entrar em READY:
  - a preparacao de `B4-12` deixou a execucao binaria pronta; faltava apenas aplicar o onboarding efetivo

### B4-14 - Validar catalogo real com runtime ativo e sessao admin
- status proposto: DONE
- objetivo: confirmar, com runtime ativo, que o catalogo `real` ficou acessivel no admin apos o onboarding controlado
- camada: produto/operacao + qa
- dependencias: `B4-13` concluida
- criterios de aceitacao:
  - `GET /health` respondendo `200`
  - autenticacao admin funcionando
  - `catalogScope=real` retornando o dataset importado
  - coexistencia administrativa `demo` + `real` confirmada
- motivo para entrar em READY:
  - `B4-13` deixou apenas a validacao assistida residual do catalogo real com runtime ativo

## DONE

- `B4-01` - Demo script operacional por role
  - evidencia final: `docs/ops/PILOT_DEMO_SCRIPT.md`
  - gate/evidencia: `docs/ops/done/B4-01.done.md`
- `B4-02` - Checklist enxuto de readiness para demonstracao assistida
  - evidencia final: `docs/ops/PILOT_DEMO_READINESS_CHECKLIST.md`
  - gate/evidencia: `docs/ops/done/B4-02.done.md`
- `B4-03` - Copy e narrativa operacional do handoff principal
  - evidencia final: ajustes em `apps/web/app/page.tsx`, `apps/web/app/seller/page.tsx` e `apps/web/app/admin/page.tsx`
  - gate/evidencia: `docs/ops/done/B4-03.done.md`
- `B4-04` - Dry-run assistido da demo com finding log
  - evidencia final: `docs/ops/PILOT_DEMO_DRY_RUN.md`
  - gate/evidencia: `docs/ops/done/B4-04.done.md`
- `B4-05` - Operator handoff card de 1 pagina
  - evidencia final: `docs/ops/PILOT_OPERATOR_HANDOFF_CARD.md`
  - gate/evidencia: `docs/ops/done/B4-05.done.md`
- `B4-07` - Consolidar rodada 2 de piloto assistido com captura estruturada de sinais
  - evidencia final: `docs/ops/PILOT_DRY_RUN_V2.md`
  - gate/evidencia: `docs/ops/done/B4-07.done.md`
- `B4-08` - Validar baseline pos-UX consolidada
  - evidencia final: `docs/ops/done/B4-08.done.md`
  - gate/evidencia: `docs/ops/done/B4-08.done.md`
- `B4-09` - Executar piloto orientado a decisao e classificar sinais
  - evidencia final: `docs/ops/PILOT_DECISION_B4-09.md`
  - gate/evidencia: `docs/ops/done/B4-09.done.md`
- `B4-10` - Definir prioridade unica de produto para a continuidade do piloto
  - evidencia final: `docs/ops/PILOT_PRODUCT_PRIORITY_B4-10.md`
  - gate/evidencia: `docs/ops/done/B4-10.done.md`
- `B4-11` - Preparar prova operacional de onboarding real controlado
  - evidencia final: `docs/ops/PILOT_ONBOARDING_PROOF_B4-11.md`
  - gate/evidencia: `docs/ops/done/B4-11.done.md`
- `B4-12` - Preparar apply controlado do onboarding real no piloto
  - evidencia final: `docs/ops/PILOT_ONBOARDING_APPLY_PREP_B4-12.md`
  - gate/evidencia: `docs/ops/done/B4-12.done.md`
- `B4-13` - Executar onboarding real controlado no piloto
  - evidencia final: `docs/ops/PILOT_ONBOARDING_APPLY_B4-13.md`
  - gate/evidencia: `docs/ops/done/B4-13.done.md`
- `B4-14` - Validar catalogo real com runtime ativo e sessao admin
  - evidencia final: `docs/ops/PILOT_REAL_CATALOG_VALIDATION_B4-14.md`
  - gate/evidencia: `docs/ops/done/B4-14.done.md`

## READY

- nenhuma task `READY` neste momento

## BLOCKED

- `B4-06`
  - motivo explicito: depende de finding relevante em `B4-04`; o dry-run atual nao deixou correcao funcional aberta

## FUTURO

- expansoes de piloto mais amplas, caso o gatilho queira aprofundar depois da primeira rodada curta
- possiveis refinamentos adicionais a partir de feedback real de demo assistida

## Ordem recomendada quando esta frente for aberta

1. `B4-01`
2. `B4-02`
3. `B4-03`

## Observacao operacional

`B4-01`, `B4-02`, `B4-03` e `B4-04` fecharam a rodada atual desta frente sem alterar a base tecnica validada em M9. O dry-run encontrou apenas drifts de teste, nao falhas abertas de fluxo do produto.
`B4-05` consolidou o artefato rapido de consulta para uso ao vivo.
`B4-07` disparou o ciclo corretivo posterior de UX/hardening. `B4-08` registrou a baseline atual como novamente apta para leitura de decisao.
`B4-09` reexecutou a leitura orientada por evidencia e manteve a decisao de seguir em `BACKLOG4`.
`B4-10` converteu essa continuidade em prioridade unica de produto: onboarding real controlado como proxima aposta do piloto.
`B4-11` validou o dry-run oficial do dataset atual e deixou a prova operacional minima pronta para a proxima rodada.
`B4-12` deixou o apply controlado pronto para autorizacao sem ainda alterar o estado do dataset do piloto.
`B4-13` executou o apply efetivo do dataset real e isolou a pendencia residual apenas na validacao HTTP/admin com runtime ativo.
`B4-14` fechou a validacao assistida do catalogo real e encerrou a rodada operacional de onboarding controlado.

## Proxima task pequena escolhida

- nenhuma task escolhida
- nenhuma task escolhida
- a sequencia de onboarding real controlado foi fechada; a frente agora aguarda novo gatilho
