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

### B5-04 - Auth production cookie/domain decision
- status proposto: DONE
- objetivo: decidir a estrategia minima e segura para desbloquear o login no browser em producao sem reescrever o fluxo de auth
- camada: infra + auth + deploy
- contexto:
  - deploy base de vitrine esta DONE
  - CORS foi validado para `https://bio-loop-orchestrator-web.vercel.app`
  - CSRF foi validado no codigo e via cliente HTTP quando cookie `csrf_token` e header `X-CSRF-Token` chegam juntos
  - login no browser permanece `BLOCKED` porque o cookie `csrf_token` nao e reenviado no POST cross-site entre Vercel e Railway
- escopo estrito:
  - decidir entre manter dominios gerenciados ou configurar dominio same-site controlado
  - mapear configuracao final de `APP_URL`, `ALLOWED_ORIGINS`, `COOKIE_SECURE`, `COOKIE_SAMESITE` e `COOKIE_DOMAIN`
  - registrar criterio de validacao via browser real
  - nao alterar UI
  - nao refatorar auth
- fora de escopo:
  - redesign
  - nova feature de login
  - troca ampla de arquitetura auth
  - persistencia nova de sessao
  - implementacao automatica de dominio
- criterios de aceitacao:
  - decisao documentada com uma unica estrategia recomendada
  - riscos de cookie cross-site explicitados
  - proxima task tecnica de deploy definida como candidata, sem promocao automatica
  - nenhuma alteracao de codigo de aplicacao
- motivo para entrada em READY:
  - e o menor passo tecnico para desbloquear o uso real em producao
  - evita mexer em UX antes de o login browser funcionar
  - preserva a disciplina de corrigir o bloqueio observado antes de ampliar produto
  - gatilho autorizou deixar a proxima do backlog como READY e aguardar execucao separada
- resultado:
  - decisao registrada em `docs/ops/AUTH_PRODUCTION_COOKIE_DOMAIN_DECISION_B5-04.md`
  - estrategia recomendada: configurar Web e API sob dominio same-site controlado, mantendo servicos separados
  - configuracao recomendada: `COOKIE_SECURE=true`, `COOKIE_SAMESITE=Lax`, `COOKIE_DOMAIN` vazio/host-only, `ALLOWED_ORIGINS` restrito a URL final da Web
  - opcoes rejeitadas: manter dominios Vercel/Railway com third-party cookies, proxy/BFF como proximo passo, remover CSRF ou redesenhar auth
  - `DEPLOY-02` permanece somente como candidata futura, sem promocao automatica para `READY`

### DEPLOY-02 - Same-site domain setup for production auth
- status proposto: CANDIDATA
- objetivo: aplicar a estrategia de dominio/cookie decidida em `B5-04` para tornar o login browser funcional em producao
- camada: deploy + infra
- dependencia-chave: `B5-04` concluida com decisao operacional explicita
- escopo estrito:
  - configurar dominio/subdominios controlados para Web e API
  - ajustar envs de producao estritamente necessarias
  - validar CORS e cookies no browser
  - registrar evidencias sem expor secrets
- fora de escopo:
  - alterar fluxo de login
  - alterar componentes Web
  - redesenhar telas
  - refatorar API
- criterio adicional de fechamento:
  - login no browser deixa de falhar por ausencia de `csrf_token`
  - buyer, seller e admin conseguem iniciar sessao em producao
  - relatorio futuro registrado em `docs/ops/done/DEPLOY-02.done.md`

### QA-08 - Browser auth production validation
- status proposto: CANDIDATA
- objetivo: validar ponta a ponta o login real no browser depois da correcao de dominio/cookie em producao
- camada: qa + auth + produto
- dependencia-chave: `DEPLOY-02` concluida
- criterios de aceitacao:
  - `GET /auth/csrf` retorna `200`
  - browser armazena `csrf_token`
  - `POST /auth/login` envia cookie `csrf_token` e header `X-CSRF-Token`
  - buyer, seller e admin entram na UI de producao
  - refresh/session hydration e logout funcionam
  - evidencias registradas sem secrets
- fora de escopo:
  - corrigir UX durante a validacao
  - abrir nova feature
  - promover `BACKLOG6` automaticamente

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

- `B5-HOTFIX-01` - Estabilizar boot inicial, auth hydration, integridade de datas e coerência de estado visível
  - evidencia final: `apps/web/lib/demo-auctions.ts`, `apps/web/components/pickup-dashboard.tsx`, `apps/web/components/route-guard.tsx`
  - gate/evidencia: `docs/ops/done/B5-HOTFIX-01.done.md`
- `B5-04` - Auth production cookie/domain decision
  - evidencia final: `docs/ops/AUTH_PRODUCTION_COOKIE_DOMAIN_DECISION_B5-04.md`
  - gate/evidencia: `docs/ops/done/B5-04.done.md`

## READY

- nenhuma task `READY` neste momento

## BLOCKED

- `B5-01`
  - motivo explicito: depende de decisao arquitetural explicita sobre a estrategia de read-model seller
- `B5-02`
  - motivo explicito: depende de contrato definido para health/readiness/telemetria operacional
- `B5-03`
  - motivo explicito: depende de decidir se a friccao local sera tratada como politica oficial ou apenas runbook de ambiente

## FUTURO

- desbloqueio de auth browser em producao por dominio/same-site controlado
- validacao browser real de buyer, seller e admin em producao
- demais hardenings estruturais guiados por risco observado em piloto, demo ou gates reais

## Proxima task pequena escolhida

- nenhuma task escolhida
- `DEPLOY-02 - Same-site domain setup for production auth` permanece candidata futura
- qualquer execucao depende de novo gatilho explicito

## Observacao operacional

Esta frente foi reativada no pos-M9 devido aos vazamentos técnicos percebidos na rodada 2 do Piloto (B4-07). O hardening ataca cirurgicamente os ruidos estéticos de API/React mapeados sem escalar para reescritas gerais de runtime. `B5-HOTFIX-01` corrigiu três problemas objetivos sem abrir nova frente: datas module-level stale em `demo-auctions.ts`, ausência de auth hydration guard em `pickup-dashboard.tsx`, e estado de loading puro sem estrutura em `route-guard.tsx`.
`B5-04` decidiu a estrategia minima para auth browser em producao: sair do par cross-site Vercel/Railway para dominio same-site controlado, mantendo Web e API separadas, `COOKIE_SAMESITE=Lax` e `COOKIE_DOMAIN` vazio/host-only inicialmente. Nenhuma configuracao real de dominio, deploy, auth, UI ou provider foi executada.
