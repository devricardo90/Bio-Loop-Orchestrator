# Post-Deploy Smoke Test

## Objetivo

Validar que o deploy de vitrine preserva a arquitetura real:

- Web separada
- API separada
- Postgres funcional
- Redis configurado
- auth cookie-based funcionando
- dados demo/real visiveis conforme esperado

## Pre-condicoes

- Web publicada em HTTPS.
- API publicada em HTTPS.
- `NEXT_PUBLIC_API_URL` da Web aponta para a API publicada.
- `ALLOWED_ORIGINS` da API inclui a Web publicada.
- `COOKIE_SECURE=true`.
- `COOKIE_SAMESITE` definido conforme a estrategia de dominio.
- `DATABASE_URL` configurado na API.
- `REDIS_URL` configurado na API.
- Migrations aplicadas.
- Seed/demo carregado.
- Dataset real aplicado somente se autorizado.

## 1. API system checks

Abrir:

```text
https://<api-host>/health
```

Esperado:

- HTTP 200
- `status` igual a `ok`
- objeto `worker` presente

Abrir:

```text
https://<api-host>/readiness
```

Esperado:

- HTTP 200
- `status` igual a `ready`
- `database.status` igual a `ready`
- worker sem degradacao impeditiva

Abrir:

```text
https://<api-host>/reference
```

Esperado:

- Scalar/OpenAPI carrega
- contratos principais aparecem

Abrir:

```text
https://<api-host>/openapi.json
```

Esperado:

- JSON OpenAPI carrega

## 2. Web boot

Abrir:

```text
https://<web-host>
```

Esperado:

- home/handoff principal carrega
- links para buyer, seller, admin e `/reference` existem
- nenhum erro de API aparece antes de login sem acao do usuario

## 3. Login

Abrir:

```text
https://<web-host>/login
```

Validar buyer, seller e admin com usuarios seedados.

Esperado:

- login funciona
- cookies sao aceitos pelo browser
- usuario e redirecionado para a area correta
- refresh/hydration de sessao nao prende a UI em estado ambiguo

Se login falhar, verificar primeiro:

- `ALLOWED_ORIGINS`
- `COOKIE_SECURE`
- `COOKIE_SAMESITE`
- `COOKIE_DOMAIN`
- `TRUST_PROXY`
- `NEXT_PUBLIC_API_URL`

## 4. Buyer source=api

Abrir:

```text
https://<web-host>/buyer/feed
```

Esperado:

- feed carrega
- `source=api` aparece
- auction detail abre
- bid panel respeita estado do auction/buyer

HOLD se:

- `source=api` nao aparece
- feed depende de fallback local
- detail quebra ou volta para login sem motivo claro

## 5. Pickup basico

Abrir:

```text
https://<web-host>/buyer/orders
```

Esperado:

- pickup queue carrega
- order detail abre quando houver ordem aplicavel
- schedule pickup/POD mostram estado coerente
- chamadas para API nao falham por CORS/cookies

## 6. Admin demo/real

Abrir:

```text
https://<web-host>/admin/buyers
```

Validar filtros:

- `demo`
- `real`
- `all`

Esperado:

- buyers carregam da API
- catalogo demo e real sao distinguiveis
- se dataset real foi aplicado, `real` mostra registros do import controlado

Abrir:

```text
https://<web-host>/admin/disputes
```

Esperado:

- disputes carregam
- filtros funcionam
- resolucao so deve ser executada se fizer parte do roteiro autorizado

## 7. Seller reports

Abrir:

```text
https://<web-host>/seller/reports
```

Esperado:

- summary carrega da API
- export CSV/JSON funciona quando houver dados no range
- erros de billing API aparecem de forma explicita se nao houver dados/configuracao

## 8. Resultado

Classificar como `PASS` se:

- API system checks passam
- Web carrega
- login funciona
- buyer prova `source=api`
- pickup basico carrega
- admin distingue demo/real
- seller reports carrega ou falha de forma explicita e explicavel por ausencia de dados
- `/reference` e `openapi.json` estao acessiveis

Classificar como `HOLD` se:

- API nao passa `/health` ou `/readiness`
- login falha por cookies/CORS
- buyer nao prova `source=api`
- admin nao consegue carregar buyers
- catalogo real esperado nao aparece apos import autorizado
- `/reference` esta indisponivel
- qualquer etapa exige improviso nao documentado

## Registro minimo

Registrar no resultado do smoke:

- data/hora
- URLs de Web e API
- commit SHA
- ambiente
- resultado `PASS` ou `HOLD`
- falhas observadas
- classificacao da falha: `PRODUTO`, `TECNICA` ou `UX`
