# DEPLOY-01B - Baseline de Deploy Validado

## Status

DONE em 2026-04-15.

## Objetivo

Registrar o ponto atual do projeto apos deploy validado de vitrine, sem iniciar nova frente tecnica e sem expor secrets.

## Estado validado

- Web publicada na Vercel.
- API publicada na Railway.
- Postgres ativo na Railway.
- Redis ativo na Railway.
- API validada em:
  - `/health`
  - `/readiness`
  - `/openapi.json`
  - `/reference`
- Web publicada e acessivel.
- Integracao Web -> API validada em nivel de deploy.
- CORS validado para `https://bio-loop-orchestrator-web.vercel.app`.
- Handshake CSRF validado no codigo e via cliente HTTP quando cookie `csrf_token` e header `X-CSRF-Token` chegam juntos.

## URLs

- Web: `https://bio-loop-orchestrator-web.vercel.app`
- API: `https://bio-loop-orchestrator-production.up.railway.app`

## Evidencia registrada

- Baseline operacional: `docs/deploy/deploy-baseline.md`
- Plano de deploy atualizado: `docs/deploy/deploy-plan.md`
- Matriz de envs mantida como referencia: `docs/deploy/env-matrix.md`
- Checklist reutilizavel de smoke: `docs/deploy/smoke-test.md`

## Pendencias nao bloqueantes

- Registrar commit SHA exato do deploy validado, se necessario.
- Executar demo assistida completa com buyer, seller e admin.
- Reavaliar dominio customizado e politica de cookies se sair dos dominios Vercel/Railway.
- Login no browser permanece bloqueado por cookie CSRF cross-site: o navegador nao envia `csrf_token` no `POST /auth/login` entre Vercel e Railway.
- Decidir proxima frente somente com novo gatilho.

## Resultado

Deploy de vitrine registrado como baseline validada.

Auth em producao: `BLOCKED` por limitacao de cookie cross-site/third-party cookie no browser, sem patch de aplicacao aplicado.

READY permanece vazia.
