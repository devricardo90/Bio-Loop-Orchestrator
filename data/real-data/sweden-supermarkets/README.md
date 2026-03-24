# SWEDEN_SUPERMARKETS_DATA_PACKAGE

Este diretorio e o ponto oficial para anexar o pacote de dados reais dos supermercados da Suecia.

## Objetivo

- receber um snapshot controlado dos dados reais
- preservar os arquivos de origem sem editar manualmente
- registrar mapeamento origem -> destino antes de qualquer import
- permitir validacao em banco limpo depois

## Estrutura esperada

- `incoming/`
  - arquivos brutos recebidos do usuario
- `templates/`
  - modelos CSV para o envio
- `mapping/`
  - mapeamento de campos e decisoes de normalizacao
- `validation/`
  - checklist e resultado de revisao

## Como enviar

Coloque os arquivos reais recebidos em `incoming/` sem renomear colunas manualmente.

Formatos aceitos:

- `csv`
- `xlsx`
- `json`
- `pdf` para anexos de apoio

## Nome recomendado dos arquivos

- `stores.csv`
- `store_contacts.csv`
- `pickup_windows.csv`
- `categories.csv`
- `buyers.csv`
- `lots_initial.csv`
- `data_dictionary.xlsx`
- `ops_rules.pdf`

## Regras

- nao editar os arquivos de origem diretamente
- se vier `xlsx`, preservar a copia original e, se necessario, derivar CSV separado
- toda decisao de limpeza ou coercao deve entrar em `mapping/field-mapping.md`
- toda ausencia de dado obrigatorio deve entrar em `validation/open-issues.md`

## Fechamento de DATA-01

`DATA-01` so fecha quando:

- o pacote real estiver anexado em `incoming/`
- o mapeamento campo-origem -> campo-destino estiver preenchido
- o checklist de validacao minima estiver marcado
- existir um registro claro do que ainda esta faltando ou foi assumido
