# [DONE] WEB-04 - Login seller/buyer

## Endpoints implementados
- `GET /auth/csrf`
- `POST /auth/login`
- `POST /auth/logout`

## O que foi feito
- Criei a tela `/login` com escolha de persona buyer/seller.
- Adicionei um cliente de auth no web que busca CSRF antes do login e sempre usa `credentials: include`.
- Incluí um provider de sessão leve no browser para manter o estado de navegação sem expor tokens.
- Adicionei um header global que sinaliza `Demo mode` ou sessão autenticada e oferece sign in/sign out.
- Mantive buyer, seller e pickup flows existentes intactos.

## Arquivos alterados
Criados:
- [apps/web/app/login/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/login/page.tsx)
- [apps/web/components/app-header.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/app-header.tsx)
- [apps/web/components/auth-session.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/auth-session.tsx)
- [apps/web/components/login-panel.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/login-panel.tsx)
- [apps/web/lib/auth-api.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/auth-api.ts)

Alterados:
- [apps/web/app/layout.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/layout.tsx)
- [apps/web/app/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/page.tsx)
- [apps/web/app/globals.css](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/globals.css)
- [apps/web/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/test/smoke.test.mjs)
- [apps/web/tsconfig.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/tsconfig.json)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/web build
```

## Gate
- Gate: WEB-04
- Resultado: PASS

## Riscos / pendencias
- A sessao do web usa `sessionStorage` apenas para navegacao; os tokens continuam exclusivamente em cookies httpOnly.
- O login usa autenticacao funcional, mas a API ainda nao faz validacao real de credenciais.
- `API-05` segue como proxima task `READY`.

## Proxima task sugerida
- `API-05`
