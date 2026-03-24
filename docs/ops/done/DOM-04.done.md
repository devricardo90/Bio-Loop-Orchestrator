# [DONE] DOM-04 - Buyer approval and dispute resolution contracts

## Endpoints implementados
- N/A for this task. This is a domain-only slice.

## O que foi feito
- Adicionei contratos de `BuyerApproval`, `BuyerApprovalDto`, `BuyerApprovalPolicy`, `ApproveBuyerRequest` e `ApproveBuyerResponse`.
- Adicionei contratos de `DisputeResolution`, `DisputeResolutionPolicy`, `ResolveDisputeRequest` ampliado e `ResolveDisputeResponse`.
- Atualizei os enums de domínio para `BuyerApprovalStatus`, `BuyerApprovalDecision`, `BuyerApprovalReason` e `DisputeResolutionDecision`.
- Registrei as transicoes de approval e resolution na state machine.
- Explicitei as regras de buyer approval e dispute resolution em `rules.md`.

## Arquivos alterados
- [packages/domain/src/types.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/src/types.ts)
- [packages/domain/src/schemas.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/src/schemas.ts)
- [packages/domain/stateMachine.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/stateMachine.md)
- [packages/domain/rules.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/packages/domain/rules.md)
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
- `API-08` ainda precisa materializar a surface de admin sobre estes contratos.
- O caso de `ESCALATE` fica como contrato mínimo e pode exigir refinamento na API.

## Proxima task sugerida
- `API-08`
