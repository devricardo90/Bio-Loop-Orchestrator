# /docs/agents/02_LOGIC_DOMAIN.md

## Agent: Domain / Business Logic Specialist

### Missão
Definir a "fonte da verdade" do produto:
- Modelos de domínio
- Estados e transições
- Eventos
- Regras e invariantes
- Contratos (DTOs) mínimos

---

## 1) Domínio: entidades principais (MVP)
### Seller/Store
- Store { id, name, address, contacts, pickupWindows[] }

### BuyerCompany
- Buyer { id, name, approved, radiusKmDefault, reputation }

### CommodityCategory
- Category { id, name, storageCondition: DRY|COLD|FROZEN, rulesDefault }

### Lot
- Lot { id, storeId, categoryId, storageCondition, pickupWindow, estimatedWeightKg, finalWeightKg?, grade: A|B|C, status }

### Auction
- Auction { id, lotId, startAt, endAt, reservePriceSekPerKg, status }

### AuctionStatus
- SCHEDULED
- LIVE
- ENDED
- VOID (sem reserva atingida / cancelado)

### Bid
- Bid { id, auctionId, buyerId, priceSekPerKg, createdAt }

### Order/Contract
- Order { id, lotId, buyerId, finalPriceSekPerKg, pickupStatus, status }

### PickupProof (POD)
- POD { id, orderId, type, url, createdAt }

---

## 2) Estados e transições (core)
### LotStatus
- DRAFT (criado internamente)
- LISTED (publicado / em leilão)
- AWARDED (tem vencedor)
- PICKUP_SCHEDULED
- PICKED_UP
- COMPLETED
- CANCELLED
- EXPIRED

### AuctionStatus
- SCHEDULED
- LIVE
- ENDED
- VOID (sem reserva atingida / cancelado)

### OrderStatus
- CREATED
- CONFIRMED (buyer confirmou)
- IN_DISPUTE
- SETTLED
- CANCELLED

---

## 3) Eventos de domínio (event-driven)
- inventory_snapshot_ingested
- rule_threshold_met
- lot_created
- auction_started
- bid_placed
- auction_extended
- auction_ended
- order_created
- pickup_scheduled
- pickup_completed
- dispute_opened
- dispute_resolved
- invoice_ready

---

## 4) Regras de negócio (invariantes)
1) Um Lot só pode ter 1 Auction ativa.
2) Bid só é aceito quando AuctionStatus == LIVE.
3) Vencedor só existe se highestBid >= reservePrice.
4) PickupWindow deve pertencer à Store e estar no futuro.
5) No-show: se passar pickupWindow sem pickup_completed -> disputa/penalidade automática.
6) Mixed lot só pode misturar itens com mesma storageCondition.

---

## 5) Edge cases (obrigatórios no MVP)
- Sem bids → auction VOID, lot EXPIRED (ou re-run 1 vez)
- Reserve não atingida → VOID
- Buyer no-show → penalidade + lot volta para LISTED (opcional) ou CANCELLED (MVP)
- Divergência de peso (estimated vs final) → ajuste no invoice (fase 2) ou tolerância fixa (MVP)
- Cancelamento por seller por compliance → CANCELLED com audit log

---

## 6) Contratos (DTOs) mínimos
### LotDTO
{ id, storeId, categoryId, storageCondition, pickupWindow, estimatedWeightKg, grade, status }

### AuctionDTO
{ id, lotId, reservePriceSekPerKg, startAt, endAt, status, highestBid? }

### BidDTO
{ id, auctionId, buyerId, priceSekPerKg, createdAt }

### OrderDTO
{ id, lotId, buyerId, finalPriceSekPerKg, status, pickupStatus }

---

## Output esperado do agente (entregáveis)
- Um arquivo /domain/types.ts (types/interfaces)
- Um arquivo /domain/stateMachine.md (tabela de transições)
- Um arquivo /domain/rules.md (invariantes + edge cases)
- Checklist de validação do domínio
