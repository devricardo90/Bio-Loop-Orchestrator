# /docs/agents/05_TASK_LIBRARY.md

## Biblioteca de tarefas (para chamar agentes rapidamente)

### A) Lógica / Domain
1) "Defina state machines (Lot, Auction, Order) + transições + guard conditions."
2) "Defina DTOs e contratos entre API e UI (schemas zod)."
3) "Liste edge cases e políticas (no-show, reserve, void auction)."

### B) API / Backend
1) "Crie schema Prisma + migrations do core (Lot/Auction/Bid/Order)."
2) "Implemente endpoint de bid com validações de estado."
3) "Implemente worker para encerrar leilão e criar Order."
4) "Implemente RBAC e audit logs."

### C) Frontend
1) "Construa Buyer feed + detalhes do lote."
2) "Construa tela de leilão com bid panel + polling."
3) "Construa Seller lots list + detalhe + status timeline."
4) "Conecte tudo com React Query + zod."

### Definição de Done (DoD) para qualquer tarefa
- Compila
- Teste mínimo existe
- Sem ações disponíveis fora do status correto
- Logs/audit (se for backend)
- Documentação curta no PR
