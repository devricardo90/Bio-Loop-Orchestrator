# Field Mapping

Pacote real anexado em `incoming/` e revisado contra o schema atual em `apps/api/prisma/schema.prisma`.

## Resultado da analise

- O pacote recebido e consistente o bastante para onboarding controlado.
- Os IDs externos sao estaveis e reutilizaveis como chaves de ingestao.
- O schema atual ainda nao preserva todos os campos de origem sem perda.
- `DB-01` continua necessario para normalizar persistencia operacional antes do import definitivo.

## Stores

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| stores.csv | store_external_id | Store | `id` | yes | usar como id estavel no import controlado | hoje o schema nao tem `external_id` separado |
| stores.csv | store_name | Store | `name` | yes | none | mapeamento direto |
| stores.csv | full_address | Store | `address` | yes | none | mapeamento direto |
| stores.csv | timezone | Store | `timezone` | yes | none | mapeamento direto |
| store_contacts.csv | contact_name/email/phone/role | Store | `contacts` | yes | agregar em JSON por loja | schema atual ja usa JSON |
| pickup_windows.csv | day_of_week/start_time/end_time/window_type | Store | `pickupWindows` | yes | agregar em JSON por loja | schema atual ja usa JSON |
| stores.csv | brand_name | Store | not persisted | no | carregar em metadata futura | requer `DB-01` |
| stores.csv | legal_entity_name | Store | not persisted | no | carregar em metadata futura | requer `DB-01` |
| stores.csv | country | Store | not persisted | no | carregar em metadata futura | requer `DB-01` |
| stores.csv | city | Store | not persisted | no | carregar em metadata futura | requer `DB-01` |
| stores.csv | postal_code | Store | not persisted | no | carregar em metadata futura | requer `DB-01` |
| stores.csv | latitude/longitude | Store | not persisted | no | carregar em metadata futura | requer `DB-01` |
| stores.csv | default_currency | Store | not persisted | no | carregar em metadata futura | requer `DB-01` |
| stores.csv | active | Store | not persisted | no | converter para metadata ou flag futura | requer `DB-01` |

## Categories

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| categories.csv | category_id | CommodityCategory | `id` | yes | usar como id estavel no import controlado | schema atual aceita string |
| categories.csv | name_en | CommodityCategory | `name` | yes | usar ingles como label principal | `name_sv` vai para JSON |
| categories.csv | name_sv | CommodityCategory | `rulesDefault.localizedNameSv` | no | mover para JSON | schema atual permite JSON em `rulesDefault` |
| categories.csv | target_industry | CommodityCategory | `rulesDefault.targetIndustry` | no | mover para JSON | schema atual permite JSON em `rulesDefault` |
| categories.csv | storage_condition | CommodityCategory | `storageCondition` | yes | derivar por categoria | nao veio no arquivo; precisa regra de mapping |

### Storage condition proposta

- `bakery_surplus` -> `DRY`
- `produce_veggies` -> `COLD`
- `dairy_short_date` -> `COLD`
- `meat_near_exp` -> `COLD`
- `dry_goods_damaged` -> `DRY`

## Buyers

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| buyers.csv | buyer_id | Buyer | `id` | yes | usar como id estavel no import controlado | schema atual aceita string |
| buyers.csv | buyer_name | Buyer | `name` | yes | none | mapeamento direto |
| buyers.csv | type | Buyer | not persisted | no | carregar em metadata futura | requer `DB-01` |
| buyers.csv | location_city | Buyer | not persisted | no | carregar em metadata futura | requer `DB-01` |
| buyers.csv | interested_categories | Buyer | not persisted | no | normalizar para tabela de interesse futura | requer `DB-01` |

### Defaults operacionais propostos

- `approved` inicial: `false`
- `radiusKmDefault`: `0` ate existir dado logistico real
- `reputation`: `0` ate existir score real
- criar `BuyerApproval.status=PENDING` para todos os buyers novos

## Lots

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| lots_initial.csv | lot_id | Lot | `id` | yes | usar como id estavel no import controlado | schema atual aceita string |
| lots_initial.csv | store_external_id | Lot | `storeId` | yes | join com `stores.csv` | depende de stores importados |
| lots_initial.csv | category_id | Lot | `categoryId` | yes | join com `categories.csv` | depende de categories importadas |
| lots_initial.csv | weight_kg | Lot | `estimatedWeightKg` | yes | decimal(12,3) | mapeamento direto |
| lots_initial.csv | expiry_timestamp | Lot | `pickupWindowEndAt` | yes | usar como limite superior | nao existe pickup window completo na origem |
| lots_initial.csv | expiry_timestamp | Lot | `pickupWindowStartAt` | yes | derivar por regra operacional da loja | depende de `pickup_windows.csv` |
| lots_initial.csv | price_sek | Auction/Order | `reservePriceSekPerKg` ou regra de pricing | no | nao importar direto ainda | preco do arquivo parece total por lote, nao SEK/kg |
| lots_initial.csv | status | Lot | `status` | yes | derivar `LISTED` por default | nao veio na origem |
| lots_initial.csv | storage_condition | Lot | `storageCondition` | yes | herdar da categoria | nao veio na origem |
| lots_initial.csv | grade | Lot | `grade` | yes | derivar default inicial | nao veio na origem |

### Defaults operacionais propostos para lots

- `status`: `LISTED`
- `grade`: `B` por default inicial
- `storageCondition`: herdado da categoria
- `finalWeightKg`: `null`

## Decisoes de normalizacao

- `Hemköp Östermalmstorg`, `Östermalmstorg`, `Sveavägen`, `Södertälje`, `Grönsaker` e `Kött` foram preservados nos dados originais do usuario; nos CSV anexados ao repo usei ASCII para manter consistencia tecnica do workspace.
- `store_contacts.csv` foi normalizado para um modelo generico `contact_name, role, email, phone`; depois consolidado em `Store.contacts`.
- `pickup_windows.csv` usa `Daily`, `Monday`, `Tuesday`, `Wednesday`, `Friday`; isso precisa ser normalizado para um enum ou convenio interno futuro em `DB-01`.
- `price_sek` em `lots_initial.csv` nao deve ser tratado como `reservePriceSekPerKg` sem regra adicional; a unidade economica aparenta ser valor total do lote.

## Open points

- decidir se `Store.id` e `Buyer.id` vao continuar aceitando IDs externos diretamente ou se o modelo vai ganhar `externalId`
- decidir estrutura persistida para `brand_name`, `legal_entity_name`, geolocalizacao e flags operacionais
- definir normalizacao de `interested_categories` dos buyers
- definir regra de derivacao de `pickupWindowStartAt` por loja quando a origem so traz `expiry_timestamp`
- definir politica para lotes com `price_sek = 0.00` se isso significa doacao, descarte ou lote sem reserva
