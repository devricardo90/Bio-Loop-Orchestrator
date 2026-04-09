# B5-HOTFIX-01 - Boot inicial, auth hydration, integridade de datas e coerência de estado visível

## Status

DONE

## Objetivo

Estabilizar cirurgicamente quatro ruídos técnicos identificados no piloto sem abrir nova frente nem expandir escopo para reescrita de runtime.

## Superfícies afetadas

- `apps/web/lib/demo-auctions.ts`
- `apps/web/components/pickup-dashboard.tsx`
- `apps/web/components/route-guard.tsx`

## Fora de escopo preservado

- seller
- admin
- API, auth backend e runtime NestJS
- redesign de componentes
- BACKLOG4 e BACKLOG6

## Problemas corrigidos

### 1. Integridade de datas — `demo-auctions.ts`

`now`, `inMinutes`, `minutesAgo` estavam declarados no topo do módulo como constantes avaliadas no momento do import. Em SSR, hot reload ou múltiplas chamadas dentro da mesma sessão, os timestamps do dataset de demonstração ficavam stale.

**Fix**: movido para dentro de `createDemoState()` — avaliados a cada invocação.

### 2. Auth hydration ausente — `pickup-dashboard.tsx`

`PickupDashboard` não usava `useAuthSession` e disparava `fetchBuyerFeed()` imediatamente no mount, antes de a sessão estar hidratada. Isso causava falhas de API no boot inicial quando o runtime real estava ativo.

**Fix**: adicionado `useAuthSession`, gate `status === "loading"` no useEffect, e proteção `!isAuthenticated` antes do fetch — alinhado ao padrão já estabelecido em `BuyerDashboard`.

### 3. Coerência de estado visível — `route-guard.tsx`

O estado de loading do `WorkspaceRouteGate` exibia texto puro `Loading buyer operations...` sem estrutura CSS nem semântica de estado, quebrando a coerência visual com buyer, pickup, seller e admin.

**Fix**: substituído por `WorkspaceState` com `tone="loading"` — padrão estabelecido em todos os demais workspaces.

## Gates executados

- `pnpm --filter @bio-loop/web typecheck`: PASS — tsc sem erros
- `pnpm --filter @bio-loop/web test`: PASS — smoke.test.mjs e web-07.test.mjs
- `pnpm --filter @bio-loop/web build`: PASS — Next.js 15.5.14, 14/14 páginas, compiled successfully in 41s
