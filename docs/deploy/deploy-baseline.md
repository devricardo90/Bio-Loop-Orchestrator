# Deploy Baseline Validado - Vitrine

## Status

DONE em 2026-04-15.

Este documento registra o marco operacional apos deploy validado de vitrine. Ele nao altera regra de negocio, nao cria recurso externo e nao registra secrets.

## Estado atual

- Web publicada na Vercel.
- API publicada na Railway.
- Postgres ativo na Railway.
- Redis ativo na Railway.
- Web acessivel publicamente.
- API acessivel publicamente.
- Integracao Web -> API validada em nivel de deploy.

## URLs validadas

| Servico | URL |
| --- | --- |
| Web | `https://bio-loop-orchestrator-web.vercel.app` |
| API | `https://bio-loop-orchestrator-production.up.railway.app` |

## Smoke test concluido

| Check | Resultado |
| --- | --- |
| API `/health` | PASS |
| API `/readiness` | PASS |
| API `/openapi.json` | PASS |
| API `/reference` | PASS |
| Web publica acessivel | PASS |
| Integracao Web -> API em deploy | PASS |

## Checkpoint auth/CORS em producao

Status em 2026-04-20:

- CORS para a Web da Vercel validado como permitido.
- Preflight de `POST /auth/login` com `Origin: https://bio-loop-orchestrator-web.vercel.app` retorna `204`.
- `Access-Control-Allow-Credentials` retorna `true`.
- `Access-Control-Allow-Headers` inclui `Content-Type` e `X-CSRF-Token`.
- `GET /auth/csrf` retorna `200`, emite `csrf_token` via cookie e retorna o mesmo valor em `csrfToken`.
- `POST /auth/login` via cliente HTTP com o mesmo cookie `csrf_token` e header `X-CSRF-Token` passa pela validacao CSRF.
- Login no browser permanece `BLOCKED`: o navegador nao envia o cookie `csrf_token` no `POST /auth/login` cross-site entre Vercel e Railway.

Conclusao operacional:

- Nao ha divergencia confirmada entre body/header/cookie/validador CSRF no codigo.
- O bloqueio atual e limitacao de cookie cross-site/third-party cookie no navegador.
- Proxima correcao deve ser de dominio/origem operacional, nao refactor de auth: colocar Web e API sob dominio same-site controlado ou validar politica de cookie do browser alvo.

## Envs operacionais sem secrets

### Web

| Variavel | Valor operacional |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://bio-loop-orchestrator-production.up.railway.app` |
| `NODE_ENV` | `production` |
| `APP_URL` | `https://bio-loop-orchestrator-web.vercel.app` |

### API

| Variavel | Valor operacional |
| --- | --- |
| `NODE_ENV` | `production` |
| `APP_URL` | `https://bio-loop-orchestrator-web.vercel.app` |
| `ALLOWED_ORIGINS` | `https://bio-loop-orchestrator-web.vercel.app` |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAMESITE` | `None`, se Web e API permanecerem em dominios diferentes |
| `COOKIE_DOMAIN` | vazio, enquanto Web e API estiverem em dominios diferentes |
| `TRUST_PROXY` | `true` |
| `OPENAPI_ENABLED` | `true` para vitrine |
| `REFERENCE_ENABLED` | `true` para vitrine |
| `PORT` | gerenciado pela Railway |
| `DATABASE_URL` | configurado na Railway, valor nao registrado |
| `REDIS_URL` | configurado na Railway, valor nao registrado |

### Secrets nao registrados

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- qualquer token de plataforma

## Pendencias pos-deploy nao bloqueantes

- Registrar commit SHA exato associado ao deploy validado, se ainda nao estiver anotado nas plataformas.
- Executar e registrar uma demo assistida completa usando o roteiro `docs/ops/ASSISTED_DEMO_SCRIPT_B4-16.md`.
- Confirmar, durante a demo, os fluxos autenticados buyer, seller e admin alem do smoke tecnico basico.
- Definir dominio final proprio, se a vitrine precisar sair dos dominios gerenciados da Vercel/Railway.
- Reavaliar `COOKIE_DOMAIN` somente se Web e API passarem a compartilhar dominio controlado.
- Resolver o bloqueio de login no browser causado por cookie CSRF cross-site entre Vercel e Railway.

## Riscos residuais

- O smoke tecnico confirma disponibilidade e integracao em deploy, mas nao substitui uma demo assistida completa com login e roles.
- Dominios gerenciados funcionam para vitrine, mas podem exigir ajuste futuro de cookie/CORS se houver dominio customizado.
- O login autenticado no browser esta bloqueado enquanto o cookie `csrf_token` nao for reenviado no POST cross-site.
- Dados demo/real devem continuar sendo tratados como estado operacional controlado; novo import real precisa de gatilho proprio.
- A exposicao de `/reference` e `/openapi.json` e adequada para vitrine validada, mas deve ser revista antes de qualquer ambiente publico mais amplo.

## Resultado

Baseline de deploy de vitrine validada.

Status final da frente: DONE.
