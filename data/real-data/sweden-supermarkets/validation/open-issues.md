# Open Issues

## Itens em aberto

- `price_sek` em `lots_initial.csv` nao esta confirmado como `SEK/kg`; hoje parece valor total do lote.
- algumas lojas/lotes nao possuem janela operacional compativel com o `expiry_timestamp`; o import atual usa fallback deterministico `expiry - 2h -> expiry` e rastreia isso em metadata.

## Assuncoes temporarias

- IDs externos podem ser usados como IDs persistidos no import controlado inicial.
- `storageCondition` pode ser derivado da categoria enquanto nao existir coluna explicita na origem.
- novos buyers entram com `approved=false`, `radiusKmDefault=0`, `reputation=0` e `BuyerApproval.status=PENDING`.
- novos lots entram com `status=LISTED`, `grade=B` e `finalWeightKg=null` ate existir modelagem mais rica.
- `pickupWindowStartAt` usa a janela da loja no mesmo dia local do expiry; sem match, o fallback operacional e `2h` antes do expiry.
