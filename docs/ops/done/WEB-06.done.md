# [DONE] WEB-06 - Admin buyers + disputes screens

## Endpoints usados
- `POST /admin/buyers/:buyerId/approve`
- `GET /admin/disputes`
- `POST /admin/disputes/:disputeId/resolve`

## O que foi feito
- Criei a surface admin do web com rotas para `buyers` e `disputes`.
- Liguei a aprovacao de buyers ao endpoint real da API admin.
- Liguei a lista e resolucao de disputas ao endpoint real da API admin.
- Adicionei fallback local para a listagem de buyers, porque a API nao expoe listagem de buyers ainda.
- Adicionei estados de loading, empty e error nas telas admin.
- Inclui a entrada de admin na navegação, no login e na landing page.

## Arquivos alterados
- [apps/web/app/admin/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/admin/page.tsx)
- [apps/web/app/admin/buyers/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/admin/buyers/page.tsx)
- [apps/web/app/admin/disputes/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/admin/disputes/page.tsx)
- [apps/web/components/admin-buyers-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/admin-buyers-dashboard.tsx)
- [apps/web/components/admin-disputes-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/admin-disputes-dashboard.tsx)
- [apps/web/lib/admin-api.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/admin-api.ts)
- [apps/web/lib/demo-admin.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/demo-admin.ts)
- [apps/web/lib/auth-api.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/auth-api.ts)
- [apps/web/components/login-panel.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/login-panel.tsx)
- [apps/web/components/app-header.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/app-header.tsx)
- [apps/web/app/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/page.tsx)
- [apps/web/app/globals.css](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/globals.css)
- [apps/web/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Decisoes tomadas
- A listagem de buyers ficou em fallback local porque o backend admin nao expõe esse endpoint.
- As açoes de approval e resolution usam a API real e caem para fallback local se houver indisponibilidade.
- Adicionei a persona `admin` ao login para entrar na surface com `PLATFORM_ADMIN`.
- Mantive o restante do web intacto para nao quebrar buyer, seller, pickup e billing.

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/web build
pnpm --filter @bio-loop/web test
```

## Gate
- Gate: WEB-06
- Resultado: PASS

## Pendencias / riscos
- A API ainda nao tem listagem de buyers; a tela usa registro local ate isso existir.
- O build do web precisou ser executado com permissao elevada para gerar os artefatos do Next neste ambiente.

## Proxima task sugerida
- Nenhuma - M4 Admin Slice ficou concluido
