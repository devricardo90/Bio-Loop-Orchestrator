# /docs/agents/04_FRONTEND_APP.md

## Agent: Frontend / UX Specialist

### Missão
Criar app web (MVP) para Seller e Buyer:
- Fluxos principais com estados corretos
- UI simples, clara e operacional
- Integração com API (fetch/React Query)

---

## 1) Rotas (Next.js sugerido)
### Seller
- /seller/dashboard
- /seller/lots
- /seller/lots/[id]
- /seller/rules
- /seller/auctions
- /seller/reports

### Buyer
- /buyer/feed
- /buyer/lots/[id]
- /buyer/auctions/[id]
- /buyer/orders
- /buyer/orders/[id]

### Admin (pode ser fase 2)
- /admin/buyers
- /admin/disputes

---

## 2) Componentes (design system mínimo)
- DataTable (lotes/leilões)
- StatusBadge (LotStatus, AuctionStatus, OrderStatus)
- LotCard (feed)
- BidPanel (lance + validações)
- PickupScheduler (janela + confirmação)
- UploadPOD (url/meta)
- FiltersBar (categoria, raio, janela)

---

## 3) Estados de UI (não quebrar funcionalidade)
- Loading / Empty / Error
- Disabled actions quando status não permite (ex.: bid fora de LIVE)
- Optimistic updates somente se API suportar idempotência
- Polling para leilões (MVP) a cada 3–5s (ou SSE/WebSocket depois)

---

## 4) Integração
- Client: React Query
- Auth: token no httpOnly cookie (ideal) ou memory + refresh
- Schema validation: zod para responses

---

## Output esperado do agente (entregáveis)
- /apps/web (Next.js)
- páginas + componentes
- integração com endpoints reais
- estados e validações por status
- storybook (opcional) ou página /dev/components
