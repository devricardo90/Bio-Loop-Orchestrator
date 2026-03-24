# [DONE] DOM-03 - Invoice, fees, and export billing contracts

## Endpoints implementados
- N/A for this task. This is a domain-only slice.

## O que foi feito
- Adicionei contratos de `Invoice`, `InvoiceDto`, `FeeLineItem`, `InvoiceLineItem`, `BillingReport`, `InvoiceExportRequest` e `InvoiceExportResponse`.
- Defini enums e tipos de domínio para `InvoiceStatus`, `FeeType` e `ExportFormat`.
- Atualizei `rules.md` com regras de billing, fee calculation e export basic.
- Inclui uma state machine de invoice para deixar o ciclo de billing explícito.

## Arquivos alterados
- [packages/domain/src/types.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/src/types.ts)
- [packages/domain/src/schemas.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/src/schemas.ts)
- [packages/domain/rules.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/rules.md)
- [packages/domain/stateMachine.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/stateMachine.md)
- [packages/domain/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/domain build
```

## Gate
- Gate: Domain task gate
- Resultado: PASS

## Riscos / pendencias
- Billing ainda nao tem persistencia ou endpoints; isso fica para `API-07`.
- O modelo de faturamento usa contratos basicos e pode precisar refinamento quando a regra fiscal ficar mais definida.

## Proxima task sugerida
- `API-07`
