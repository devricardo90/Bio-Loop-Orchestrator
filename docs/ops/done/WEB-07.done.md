# [DONE] WEB-07 - Session guards and role-aware routing

## Endpoints implementados
- N/A. This task is frontend-only and does not touch `apps/api`.

## O que foi feito
- Added a shared workspace access policy helper for buyer, seller, and admin routing.
- Wrapped the buyer, seller, and admin route segments in a client-side guard that redirects unauthorized roles.
- Updated the header to show role-aware navigation instead of global cross-persona links.
- Removed cross-role shortcuts from buyer, seller, and pickup surfaces so navigation matches the active persona.
- Added a dedicated WEB-07 smoke test and updated the existing smoke test to reflect the new navigation model.

## Arquivos alterados
Criados:
- [apps/web/lib/route-access.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/route-access.ts)
- [apps/web/components/route-guard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/route-guard.tsx)
- [apps/web/app/buyer/layout.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/buyer/layout.tsx)
- [apps/web/app/seller/layout.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/seller/layout.tsx)
- [apps/web/app/admin/layout.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/admin/layout.tsx)
- [apps/web/test/web-07.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/test/web-07.test.mjs)

Alterados:
- [apps/web/components/app-header.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/app-header.tsx)
- [apps/web/components/login-panel.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/login-panel.tsx)
- [apps/web/components/buyer-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/buyer-dashboard.tsx)
- [apps/web/components/seller-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/seller-dashboard.tsx)
- [apps/web/components/pickup-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/pickup-dashboard.tsx)
- [apps/web/package.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/package.json)
- [apps/web/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm.cmd -w typecheck
pnpm.cmd --filter @bio-loop/web test
pnpm.cmd --filter @bio-loop/web build
```

## Gate
- Gate: WEB-07
- Resultado: PASS

## Riscos / pendencias
- The redirect is client-side because the current auth session is browser-backed.
- Public landing links still advertise the buyer/seller/admin surfaces, but the protected workspaces now redirect to the correct role.
- `QA-02` remains blocked until the browser smoke flows are added.

## Proxima task sugerida
- `QA-02`
