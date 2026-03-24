# [DONE] WEB-08 Remove residual frontend fallbacks and bind seller/admin demo surfaces to real API data

## O que foi feito
- Troquei `admin/buyers` para carregar a listagem real via `GET /admin/buyers`.
- Removi o fallback demo/local do fluxo de buyers e passei a atualizar o estado somente com o retorno da API.
- Troquei `admin/disputes` para depender apenas da API, sem cair para fila demo local.
- Removi os textos de fallback residual da surface de seller reports e passei a tratar erro como erro real de API.
- Ajustei a home do admin para refletir dados seedados e não demo local.
- Atualizei o smoke test do web para cobrir `listAdminBuyers`.

## Arquivos alterados
Criados:
- [docs/ops/done/WEB-08.done.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/done/WEB-08.done.md)

Alterados:
- [apps/web/lib/admin-api.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/admin-api.ts)
- [apps/web/components/admin-buyers-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/admin-buyers-dashboard.tsx)
- [apps/web/components/admin-disputes-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/admin-disputes-dashboard.tsx)
- [apps/web/components/seller-reports.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/seller-reports.tsx)
- [apps/web/app/admin/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/admin/page.tsx)
- [apps/web/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm.cmd --filter @bio-loop/web typecheck
pnpm.cmd --filter @bio-loop/web test
pnpm.cmd -w typecheck
pnpm.cmd -w test
```

## Gate e resultado
- `pnpm.cmd --filter @bio-loop/web typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd -w typecheck`: PASS
- `pnpm.cmd -w test`: PASS
- `pnpm.cmd --filter @bio-loop/web build`: FAIL no ambiente atual com `spawn EPERM`

## Riscos / pendencias
- O `web build` ainda está limitado pelo ambiente local (`spawn EPERM`), não por erro de TypeScript.
- `DOCS-01` agora é a próxima task `READY`.
- `QA-03` continua bloqueada até a documentação operacional ficar pronta.

## Conclusao
- `PASS`
