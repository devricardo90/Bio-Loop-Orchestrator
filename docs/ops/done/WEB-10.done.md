# [DONE] WEB-10 Hardening de error, loading e empty states

## O que foi entregue

- componente reutilizavel `WorkspaceState` criado para padronizar loading, error e empty states
- buyer feed/detail e pickup workspace agora exibem estados operacionais consistentes com CTA de retry ou retorno
- admin buyers e admin disputes receberam empty/error states sem dead-end visual
- seller billing passou a usar os mesmos estados operacionais padronizados
- smoke tests e e2e continuaram verdes apos a padronizacao

## Gate executado

- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd test:e2e`: PASS

## Resultado pratico

- buyer, seller e admin agora respondem com mensagens explicitas para loading, API unavailable e empty
- a navegacao nao termina mais em paines vazios sem CTA
- o proximo passo natural e endurecer refresh/logout/session-expired no fluxo de auth
