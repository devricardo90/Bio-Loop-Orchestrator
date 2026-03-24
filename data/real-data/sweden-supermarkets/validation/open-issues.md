# Open Issues

## Itens em aberto

- O schema atual de `Store` nao persiste `brand_name`, `legal_entity_name`, `country`, `city`, `postal_code`, `latitude`, `longitude`, `default_currency` e `active` como campos estruturados.
- O schema atual de `Buyer` nao persiste `type`, `location_city` nem a relacao `interested_categories`.
- O schema atual de `Lot` exige `pickupWindowStartAt`, `pickupWindowEndAt`, `grade`, `status` e `storageCondition`, mas a origem so fornece `expiry_timestamp`, `weight_kg` e `category_id`.
- `price_sek` em `lots_initial.csv` nao esta confirmado como `SEK/kg`; hoje parece valor total do lote.
- `pickup_windows.csv` usa `Daily` e nomes textuais de dias; isso precisa de convenio interno claro antes do import automatizado.

## Assuncoes temporarias

- IDs externos podem ser usados como IDs persistidos no import controlado inicial.
- `storageCondition` pode ser derivado da categoria enquanto nao existir coluna explicita na origem.
- novos buyers entram com `approved=false`, `radiusKmDefault=0`, `reputation=0` e `BuyerApproval.status=PENDING`.
- novos lots entram com `status=LISTED`, `grade=B` e `finalWeightKg=null` ate existir modelagem mais rica.
