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
- frente aprovada pelo gatilho como proxima prioridade principal

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

## Proxima task pequena escolhida

- nenhuma task escolhida
- a rodada 2 do piloto gerou evidencias claras (B4-07); aguardando direcao do gatilho para decidir a ativacao das frentes recomendadas (BACKLOG6 e BACKLOG5).
