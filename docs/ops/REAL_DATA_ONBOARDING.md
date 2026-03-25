# REAL_DATA_ONBOARDING.md

## Objetivo

Definir quando o usuario deve enviar os dados reais dos supermercados da Suecia e quais informacoes/documentos precisam ser anexados ao projeto para a entrada de dados acontecer sem retrabalho.

---

## Momento correto para envio dos dados reais

O momento correto nao e agora, antes do alinhamento de seed e identidade entre web/API.

### Regra operacional

- Enviar os dados reais **depois de `DB-03`**.
- Preferencialmente iniciar a ingestao real **antes de `API-12` e `WEB-09`**.

### Motivo

- `DB-03` organiza o seed em modo idempotente e alinha ids/personas/cenarios entre banco, API e web.
- Sem isso, os dados reais correm risco de entrar num modelo ainda muito acoplado ao dataset de demo.
- Depois de `DB-03`, o orquestrador consegue criar uma task especifica de onboarding real com menos risco de drift entre banco, API e frontend.

### Janela recomendada

1. Concluir `DB-03`
2. Receber o pacote de dados reais
3. Criar task dedicada de onboarding real
4. Executar onboarding antes de ligar auth real completo e buyer read-model real (`API-12` / `API-13` / `WEB-09`)

---

## Pacote minimo de dados para envio

O ideal e enviar um documento estruturado por supermercado, mais os anexos auxiliares.

### 1. Cadastro do supermercado

Para cada supermercado/site/unidade:

- `store_external_id`
- `store_name`
- `brand_name`
- `legal_entity_name`
- `country` = `SE`
- `city`
- `full_address`
- `postal_code`
- `timezone`
- `latitude`
- `longitude`
- `default_currency`
- `active` (`true`/`false`)

### 2. Contatos operacionais

Para cada unidade:

- `ops_contact_name`
- `ops_contact_email`
- `ops_contact_phone`
- `pickup_contact_name`
- `pickup_contact_email`
- `pickup_contact_phone`

### 3. Janelas operacionais

- horario padrao de coleta
- dias da semana atendidos
- horarios de corte para publicacao de lotes
- restricoes logisticas
- observacoes de doca/acesso/cadeia fria

### 4. Categorias e tipos de material

Para cada categoria real operada:

- `category_external_id`
- `category_name`
- `material_type`
- `storage_condition`
- `uom` (`kg`, `unit`, etc.)
- `min_weight_kg`
- `max_days_to_pickup`
- `quality_rules`
- `notes`

### 5. Compradores e contrapartes reais

Se ja existirem buyers reais para onboarding:

- `buyer_external_id`
- `buyer_name`
- `legal_entity_name`
- `country`
- `city`
- `full_address`
- `contact_name`
- `contact_email`
- `contact_phone`
- `approved_status`
- `reputation_or_risk_label` se existir

### 6. Historico inicial de lotes ou dataset de partida

Se voce quiser importar dados reais ou semi-reais logo no bootstrap:

- `lot_external_id`
- `store_external_id`
- `category_external_id`
- `created_at`
- `pickup_window_start_at`
- `pickup_window_end_at`
- `estimated_weight_kg`
- `final_weight_kg` se existir
- `grade`
- `storage_condition`
- `status`
- `notes`

### 7. Campos de compliance e operacao

- flags de LGPD/GDPR equivalentes para uso interno
- base legal/consentimento se houver dado pessoal
- restricoes de compartilhamento
- classificacao do dado (`demo`, `internal`, `restricted`)

---

## Formato recomendado do envio

### Documento principal

Enviar um dos formatos abaixo:

- `CSV` por entidade
- `XLSX` com abas separadas
- `JSON` estruturado

### Estrutura recomendada de abas/arquivos

- `stores`
- `store_contacts`
- `pickup_windows`
- `categories`
- `buyers`
- `lots_initial` (opcional)
- `data_dictionary`

### Anexos uteis

- dicionario de dados
- exemplo de export real do ERP/POS/WMS
- regras operacionais escritas pelo time de operacao
- mapeamento de categorias locais para categorias do produto

---

## Requisitos de qualidade antes do envio

- ids externos estaveis por entidade
- timezone consistente
- datas em ISO-8601 quando possivel
- pesos e valores com unidade clara
- codigos/labels padronizados
- campos obrigatorios preenchidos
- um responsavel de negocio para responder duvidas de mapeamento

---

## Como o documento sera anexado ao projeto

Quando o usuario enviar os dados reais, o orquestrador deve abrir uma task dedicada de onboarding real com:

- snapshot do pacote recebido
- mapeamento campo-origem -> campo-destino
- regras de validacao
- estrategia de seed/import
- checklist de sanitizacao
- gate de validacao em banco limpo

### Local oficial no repositorio

O pacote deve ser anexado em:

- [data/real-data/sweden-supermarkets/README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/data/real-data/sweden-supermarkets/README.md)

Estrutura pronta:

- `data/real-data/sweden-supermarkets/incoming/`
- `data/real-data/sweden-supermarkets/templates/`
- `data/real-data/sweden-supermarkets/mapping/`
- `data/real-data/sweden-supermarkets/validation/`

---

## Observacao importante

Enquanto `API-12`, `API-13` e `WEB-09` nao estiverem concluidas, os dados reais devem entrar primeiro como **dataset controlado de onboarding**, e nao como mudanca improvisada no seed principal de demo.

## Estado atual apos DATA-02

`DATA-02` agora existe como trilha operacional concreta:

- script: `apps/api/prisma/import-real-data.mjs`
- validacao: `pnpm.cmd --filter @bio-loop/api db:import-real:dry-run`
- import: `pnpm.cmd --filter @bio-loop/api db:import-real`

O processo atual:

- le os CSVs oficiais em `data/real-data/sweden-supermarkets/incoming/`
- valida colunas, duplicidades e integridade referencial
- importa stores, categories, buyers, approvals, interests e lots em transacao unica
- preserva o dataset demo e marca os registros reais com `metadata.dataset = "sweden-supermarkets"`

## Estado atual apos DATA-03

O runtime local agora opera com catalogo misto sob uma regra conservadora:

- APIs administrativas usam `catalogScope=demo` por padrao
- `catalogScope=all` e `catalogScope=real` ficam disponiveis para revisao controlada do dataset importado
- isso preserva QA manual/e2e e evita que o import real desloque os fluxos seeded por padrao
