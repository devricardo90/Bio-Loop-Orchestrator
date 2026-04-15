# B4-15 - Pilot Evidence Pack pos-onboarding real

## Status

- Consolidado em: 2026-04-14
- Frente: `BACKLOG4` - Piloto / Produto / Operacao
- Tipo: evidencia operacional

## Objetivo

Registrar, em formato curto, o que o piloto ja consegue demonstrar depois do onboarding real validado em `B4-14`, sem abrir feature, redesign, refactor ou hardening tecnico.

## Leitura executiva

O piloto esta apto a demonstrar uma jornada assistida com:

- runtime local documentado e previsivel
- autenticacao real por role
- buyer operando com dados vindos da API
- seller com overview, lots, results e reports navegaveis
- admin com leitura de buyers/disputes e separacao de catalogo `demo` vs `real`
- catalogo real `sweden-supermarkets` acessivel via admin
- endpoints operacionais de saude e referencia disponiveis

Esta evidencia nao substitui uma demo assistida. Ela define o que deve ser demonstrado e quais sinais tornam a demo bem-sucedida.

## Evidencia por role

### Buyer

O buyer deve demonstrar:

- login com usuario seedado
- feed carregado com `source=api`
- abertura de auction detail
- continuidade para pickup/orders quando aplicavel
- acesso contextual a `/reference`

Evidencia de base:

- `QA-07` fechou o checklist consolidado do piloto com browser e2e verde
- `POST_M7_RELEASE_GATE.md` define o caminho buyer esperado
- `PILOT_RUNTIME_PROFILE.md` exige que o buyer preserve `source=api`

### Seller

O seller deve demonstrar:

- acesso autenticado por role
- leitura de overview operacional
- consulta de lots/results
- reports exportaveis
- caminho sem fallback silencioso ou dead-end operacional

Evidencia de base:

- `WEB-14` vinculou surfaces seller ao fluxo real de dados da API
- `QA-07` inclui seller route guard e export de seller reports
- `POST_M7_RELEASE_GATE.md` define review manual de `/seller`, `/seller/results` e `/seller/reports`

### Admin

O admin deve demonstrar:

- login com `platform.admin@bioloop.dev`
- buyers e disputes navegaveis
- distincao operacional entre catalogos `demo`, `real` e `all`
- leitura do catalogo real validado em `B4-14`

Evidencia de base:

- `PILOT_REAL_CATALOG_VALIDATION_B4-14.md` confirmou `GET /admin/buyers?catalogScope=real` com `200`
- `B4-14` observou 5 buyers do dataset `sweden-supermarkets`
- `GET /admin/disputes?catalogScope=all` confirmou coexistencia administrativa sem quebrar o dataset demo

## Catalogo real/demo

O piloto deve explicar a convivencia controlada entre:

- `demo`: dataset conservador usado para QA manual/e2e e exemplos estaveis
- `real`: dataset importado `sweden-supermarkets`, com `source` observado como `sweden_real_import`
- `all`: leitura administrativa de coexistencia quando a demo precisa comparar contextos

Sinal minimo de sucesso:

- admin consegue filtrar `catalogScope=real`
- registros reais aparecem sem sobrescrever o seed demo
- a narrativa deixa claro quando a tela mostra dado demo, real ou combinado

## Endpoints operacionais

Antes ou durante a demo assistida, validar:

- `GET /health`
- `GET /readiness`
- `/reference`

Sinal minimo de sucesso:

- `/health` responde `200`
- `/readiness` nao reporta degradacao impeditiva
- `/reference` esta acessivel e coerente com as acoes mostradas na UI

## Criterios de sucesso da proxima demo assistida

A proxima demonstracao assistida deve ser considerada `PASS` quando:

- o runtime sobe nas portas documentadas em `PILOT_RUNTIME_PROFILE.md`
- auth aceita usuarios seedados e rejeita credenciais invalidas
- buyer carrega feed com `source=api`
- seller navega overview, lots, results e reports sem dead-end
- admin demonstra catalogo `real` e coexistencia com `demo`
- `/health`, `/readiness` e `/reference` sustentam a narrativa operacional
- qualquer friccao observada e classificada como `PRODUTO`, `UX` ou `TECNICA`, sem correcao automatica durante a demo

A demo deve ser considerada `HOLD` quando:

- seeded login falha
- buyer perde `source=api`
- admin nao consegue acessar `catalogScope=real`
- route guard prende o usuario em estado ambiguo
- `/reference` fica indisponivel ou desconectado das acoes demonstradas
- a execucao exige improviso fora do runtime profile

## Limites desta evidencia

Este pack nao autoriza:

- implementacao de feature
- redesign
- refactor de seller/jobs/API/runtime
- abertura de subtasks tecnicas
- promocao automatica de nova task `READY`

## Decisao operacional

`B4-15` fecha a transformacao da validacao real de `B4-14` em evidencia operacional curta para a proxima demonstracao assistida.

Depois deste pack, qualquer nova execucao deve depender de novo gatilho explicito.
