# [DONE] API-12 Auth real com identidade persistida

## O que foi entregue

- `User.passwordHash` adicionado ao schema Prisma com migration dedicada
- seed dos usuarios demo atualizado com senha real persistida
- `AuthService` agora autentica contra `User` persistido via Prisma
- cookies httpOnly, refresh e CSRF mantidos sem mudar o contrato do frontend
- login invalido agora falha por credencial incorreta ou role divergente
- quickstart/login UI atualizados para refletir `demo-password` como credencial seedada

## Gate executado

- `pnpm.cmd --filter @bio-loop/api prisma:generate`: PASS
- `pnpm.cmd --filter @bio-loop/api db:seed`: PASS
- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/api test`: PASS
- `pnpm.cmd test:e2e`: PASS

## Resultado pratico

- auth deixou de aceitar qualquer email/senha nao vazios
- buyer, seller e admin continuam entrando com o fluxo real de cookie + CSRF
- `API-13` agora pode assumir identidade persistida para convergir buyer flow aos IDs reais da API
