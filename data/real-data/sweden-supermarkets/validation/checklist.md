# Validation Checklist

- [x] Arquivos de origem colocados em `incoming/`
- [x] Snapshot original preservado sem edicao manual substancial
- [x] `stores` recebido
- [x] `store_contacts` recebido
- [x] `pickup_windows` recebido
- [x] `categories` recebido
- [x] `buyers` recebido
- [x] `lots_initial` recebido
- [x] IDs externos estaveis presentes
- [x] Datas em formato ISO-8601 ou regra de conversao documentada
- [x] Timezone consistente
- [x] Pesos com unidade explicita
- [x] Enum de `storageCondition` proposto e documentado
- [x] `mapping/field-mapping.md` preenchido
- [x] `validation/open-issues.md` preenchido
- [x] Pacote pronto para `DB-01` normalizar e depois importar em banco limpo

## Observacao

O pacote foi validado para onboarding controlado, mas o import definitivo ainda depende de `DB-01` para evitar perda de informacao operacional hoje fora do schema.
