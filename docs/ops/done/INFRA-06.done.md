# [DONE] INFRA-06 CI split para gates rapidos e gates pesados

## O que foi entregue

- workflow de CI separado em dois jobs em `.github/workflows/ci.yml`
- job `quick` com install, `prisma:generate`, `lint`, `typecheck` e `test`
- job `heavy` dependente de `quick` com `prisma:drift`, `db:verify-clean`, instalacao de Chromium e `test:e2e`
- ambiente de Postgres/Redis e variaveis compartilhadas definidos de forma consistente entre os dois gates

## Gate executado

- revisao estrutural de `.github/workflows/ci.yml`: PASS
- coerencia com scripts do repo em `package.json`: PASS
- coerencia documental com o objetivo do split quick/heavy: PASS

## Resultado pratico

- o CI agora entrega feedback rapido para regressao comum e separa os gates pesados de banco/browser
- o desenho atual do pipeline bate com a intencao declarada no backlog da fase M9
- `WEB-14` passa a ser a proxima task pequena pronta para validacao real
