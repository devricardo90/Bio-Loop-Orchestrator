# [DONE] INFRA-03 - Observability minimum

## Endpoints implementados
- `GET /health`
- `GET /readiness`

## O que foi feito
- Adicionei `X-Request-Id` por request com geração automática quando o header não vem do cliente.
- Implementei logging estruturado em JSON no bootstrap da API.
- Liguei o logger estruturado ao Nest para logs da aplicação e para o ciclo de request/response.
- Expus um health check leve e um readiness check que valida a conectividade do Prisma.
- Atualizei backlog e status para marcar o hardening de observabilidade como concluído.

## Arquivos alterados
- [apps/api/src/main.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/main.ts)
- [apps/api/src/app.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/app.controller.ts)
- [apps/api/src/observability/structured-logger.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/observability/structured-logger.ts)
- [apps/api/src/observability/request-id.middleware.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/observability/request-id.middleware.ts)
- [apps/api/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm.cmd --filter @bio-loop/api prisma:generate
pnpm.cmd -w typecheck
pnpm.cmd -w test
pnpm.cmd --filter @bio-loop/api build
pnpm.cmd --filter @bio-loop/api test
```

## Gate
- Gate: `INFRA-03`
- Resultado: `PASS`

## Riscos / pendencias
- `readiness` depende do Prisma e da base do app; se o banco estiver indisponível, o endpoint retorna `503`.
- O logger estruturado é local ao processo e ainda não está integrado a um coletor externo.

## Proxima task sugerida
- Nenhuma. O backlog atual ficou sem itens `READY`.
