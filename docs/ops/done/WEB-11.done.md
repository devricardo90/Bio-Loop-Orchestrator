# [DONE] WEB-11 Session lifecycle e auth UX hardening

## O que foi entregue

- `AuthSessionProvider` passou a reidratar a sessao via `refresh` real da API antes de liberar a UI protegida
- o frontend agora agenda refresh automatico antes do vencimento do access token e invalida a sessao local de forma controlada quando ela expira
- guards protegidos redirecionam para `/login?reason=session-expired` sem deixar a interface presa em estado ambiguo
- a tela de login e o header passaram a refletir sessao expirada de forma explicita
- smoke tests foram atualizados para cobrir a nova base de refresh/session-expired

## Gate executado

- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd test:e2e`: FAIL (`spawn EPERM` no ambiente local ao iniciar Playwright)

## Resultado pratico

- a reabertura do navegador deixa de confiar apenas no `sessionStorage` e tenta sincronizar a sessao com os cookies reais da API
- sessao expirada agora manda o usuario de volta para login com contexto claro
- o proximo passo natural e ligar a UX operacional diretamente ao `/reference` e consolidar o release gate pos-M7
