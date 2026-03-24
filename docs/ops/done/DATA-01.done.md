# [DONE] DATA-01 Onboarding de dados reais dos supermercados da Suecia

## O que foi entregue

- estrutura oficial de intake criada em `data/real-data/sweden-supermarkets/`
- diretorio `incoming/` preenchido com o pacote real enviado pelo usuario
- templates CSV para `stores`, `store_contacts`, `pickup_windows`, `categories`, `buyers`, `lots_initial` e `data_dictionary`
- mapeamento origem -> destino revisado contra o schema atual
- checklist de validacao preenchido
- registro de gaps reais que dependem de `DB-01`
- backlog/status atualizados para refletir o fechamento da task

## Resultado da analise

- o pacote tem IDs externos estaveis e dados suficientes para onboarding controlado
- a origem cobre stores, contatos, janelas operacionais, categorias, buyers e lotes iniciais
- o schema atual ainda perde informacao operacional relevante sem `DB-01`

## Arquivos anexados

- `stores.csv`
- `store_contacts.csv`
- `pickup_windows.csv`
- `categories.csv`
- `buyers.csv`
- `lots_initial.csv`

## Proximo passo sugerido

- `DB-01` para normalizar o schema Prisma e preservar `external_id`, geografia, metadata operacional, contatos e interesses de buyer sem improviso
