# [DOING] DATA-01 Onboarding de dados reais dos supermercados da Suecia

## O que foi entregue nesta execucao

- estrutura oficial de intake criada em `data/real-data/sweden-supermarkets/`
- diretorio `incoming/` preparado para receber o snapshot bruto
- templates CSV para `stores`, `store_contacts`, `pickup_windows`, `categories`, `buyers`, `lots_initial` e `data_dictionary`
- documentos de `mapping` e `validation` criados para revisar origem -> destino e pendencias
- backlog/status atualizados para refletir que a task esta em execucao, aguardando o envio do pacote real

## Gate pendente

`DATA-01` ainda nao fecha porque faltam os arquivos reais do usuario em:

- `data/real-data/sweden-supermarkets/incoming/`

## Proxima acao do usuario

Anexar o pacote real nesse diretorio com os arquivos de origem e, se houver, anexos auxiliares como:

- `stores.csv`
- `store_contacts.csv`
- `pickup_windows.csv`
- `categories.csv`
- `buyers.csv`
- `lots_initial.csv`
- `data_dictionary.xlsx`
- `ops_rules.pdf`
