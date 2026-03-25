# Field Mapping

Pacote real anexado em `incoming/` e revisado contra o schema atual em `apps/api/prisma/schema.prisma`.

## Resultado da analise

- O pacote recebido e consistente o bastante para onboarding controlado.
- Os IDs externos sao estaveis e reutilizaveis como chaves de ingestao.
- O schema atual ja preserva a maior parte dos campos estruturados de `Store`, `Buyer` e `CommodityCategory`.
- O import oficial de `DATA-02` usa um processo dedicado e nao altera o seed demo.

## Stores

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| stores.csv | store_external_id | Store | `id` | yes | usar como id estavel no import controlado | `externalId` tambem e preenchido com o mesmo valor |
| stores.csv | store_name | Store | `name` | yes | none | mapeamento direto |
| stores.csv | brand_name | Store | `brandName` | yes | none | persistencia estruturada existente |
| stores.csv | legal_entity_name | Store | `legalEntityName` | yes | none | persistencia estruturada existente |
| stores.csv | country | Store | `countryCode` | yes | none | persistencia estruturada existente |
| stores.csv | city | Store | `city` | yes | none | persistencia estruturada existente |
| stores.csv | full_address | Store | `address` | yes | none | mapeamento direto |
| stores.csv | postal_code | Store | `postalCode` | yes | none | persistencia estruturada existente |
| stores.csv | timezone | Store | `timezone` | yes | none | mapeamento direto |
| stores.csv | latitude/longitude | Store | `latitude` / `longitude` | yes | decimal(9,6) | persistencia estruturada existente |
| stores.csv | default_currency | Store | `defaultCurrency` | yes | none | persistencia estruturada existente |
| stores.csv | active | Store | `isActive` | yes | `true`/`false` -> boolean | persistencia estruturada existente |
| store_contacts.csv | contact_name/email/phone/role | Store | `contacts` | yes | agregar em JSON por loja | schema atual ja usa JSON |
| pickup_windows.csv | day_of_week/start_time/end_time/window_type | Store | `pickupWindows` | yes | agregar em JSON por loja | schema atual ja usa JSON |

## Categories

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| categories.csv | category_id | CommodityCategory | `id` | yes | usar como id estavel no import controlado | `externalId` tambem e preenchido com o mesmo valor |
| categories.csv | name_en | CommodityCategory | `name` | yes | usar ingles como label principal | mapeamento direto |
| categories.csv | name_sv | CommodityCategory | `localizedNameSv` | yes | none | persistencia estruturada existente |
| categories.csv | target_industry | CommodityCategory | `targetIndustry` | yes | none | persistencia estruturada existente |
| categories.csv | storage_condition | CommodityCategory | `storageCondition` | yes | derivar por categoria | nao veio no arquivo; usa regra fixa de mapping |

### Storage condition aplicada

- `bakery_surplus` -> `DRY`
- `produce_veggies` -> `COLD`
- `dairy_short_date` -> `COLD`
- `meat_near_exp` -> `COLD`
- `dry_goods_damaged` -> `DRY`

## Buyers

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| buyers.csv | buyer_id | Buyer | `id` | yes | usar como id estavel no import controlado | `externalId` tambem e preenchido com o mesmo valor |
| buyers.csv | buyer_name | Buyer | `name` | yes | none | mapeamento direto |
| buyers.csv | type | Buyer | `buyerType` | yes | none | persistencia estruturada existente |
| buyers.csv | location_city | Buyer | `city` | yes | none | persistencia estruturada existente |
| buyers.csv | interested_categories | Buyer | `BuyerCategoryInterest` | yes | split por `;` e criar relacao | persistencia estruturada existente |

### Defaults operacionais aplicados

- `approved`: `false`
- `radiusKmDefault`: `0`
- `reputation`: `0`
- `BuyerApproval.status`: `PENDING`
- `BuyerApproval.reason`: `MANUAL_REVIEW`

## Lots

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| lots_initial.csv | lot_id | Lot | `id` | yes | usar como id estavel no import controlado | `externalId` tambem e preenchido com o mesmo valor |
| lots_initial.csv | store_external_id | Lot | `storeId` | yes | join com `stores.csv` | depende de stores importados |
| lots_initial.csv | category_id | Lot | `categoryId` | yes | join com `categories.csv` | depende de categories importadas |
| lots_initial.csv | weight_kg | Lot | `estimatedWeightKg` | yes | decimal(12,3) | mapeamento direto |
| lots_initial.csv | expiry_timestamp | Lot | `pickupWindowEndAt` | yes | usar como limite superior | valor final nao pode ultrapassar o expiry |
| lots_initial.csv | expiry_timestamp | Lot | `pickupWindowStartAt` | yes | derivar por regra operacional da loja | usa janela do mesmo weekday; sem match, fallback `expiry - 2h` |
| lots_initial.csv | price_sek | Lot metadata | `metadata.sourcePriceSek` | yes | preservar valor cru | nao importar como `reservePriceSekPerKg` |
| lots_initial.csv | status | Lot | `status` | yes | derivar `LISTED` por default | nao veio na origem |
| lots_initial.csv | storage_condition | Lot | `storageCondition` | yes | herdar da categoria | nao veio na origem |
| lots_initial.csv | grade | Lot | `grade` | yes | derivar default inicial | nao veio na origem |

### Defaults operacionais aplicados para lots

- `status`: `LISTED`
- `grade`: `B`
- `finalWeightKg`: `null`
- `sourceExpiresAt`: igual ao `expiry_timestamp`

## Decisoes de normalizacao

- `store_contacts.csv` foi normalizado para um modelo generico `contact_name, role, email, phone`; depois consolidado em `Store.contacts`.
- `pickup_windows.csv` usa `Daily`, `Monday`, `Tuesday`, `Wednesday`, `Friday`; no import oficial isso foi normalizado para JSON de `Store.pickupWindows`.
- registros importados recebem `metadata.dataset = "sweden-supermarkets"` para coexistencia segura com o seed demo.
- `pickupWindowStartAt` usa a janela da loja no dia local do `expiry_timestamp`; sem match, o fallback deterministico e `expiry - 2h -> expiry` com rastreio em metadata.
- `price_sek` em `lots_initial.csv` nao deve ser tratado como `reservePriceSekPerKg` sem regra adicional; a unidade economica aparenta ser valor total do lote.

## Open points

- definir politica de negocio para `price_sek = 0.00` se isso significa doacao, descarte ou lote sem reserva
- decidir se a fallback window de `expiry - 2h` deve continuar no import definitivo ou migrar para regra por store/brand
