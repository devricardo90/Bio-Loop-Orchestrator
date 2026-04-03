# B4-10 - Prioridade de produto apos a rodada orientada a decisao

## Status

- Concluido em: 2026-04-03

## Objetivo

Transformar a continuidade aprovada de `BACKLOG4` em uma prioridade unica, curta e auditavel para a proxima rodada de produto do piloto.

## Base usada

- [PILOT_DECISION_B4-09.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/PILOT_DECISION_B4-09.md)
- [produto.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/produto.md)
- [REAL_DATA_ONBOARDING.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/REAL_DATA_ONBOARDING.md)
- seller reports/billing e admin mixed catalog ja operacionais no runtime atual

## Leitura objetiva

O produto ja demonstra:

- narrativa funcional por role
- baseline de UX suficientemente consolidada para piloto
- runtime com dados reais controlados convivendo com dataset demo
- camada de billing/reports ja suficiente para demonstracao assistida

O produto ainda nao demonstra, com forca equivalente:

- um passo claro de expansao comercial/operacional do piloto
- qual artefato ou fluxo deve ser usado para provar readiness de onboarding real
- qual recorte de dados reais deve virar prova concreta de proxima fase

## Prioridade escolhida

- prioridade unica: **piloto com onboarding real controlado**

## O que isso significa

A proxima rodada de `BACKLOG4` deve priorizar a prova de entrada controlada de parceiro/dataset real no piloto, usando o trilho ja existente de import e validacao, sem abrir redesign nem hardening estrutural por impulso.

## O que nao priorizar agora

- automacao nova de billing
- relatorios avancados
- ampliacao de paineis seller/admin
- novo ciclo de polish visual

## Justificativa

1. A tese central do produto depende de converter operacao real de excedente em fluxo confiavel e rastreavel.
2. O repositorio ja possui trilha concreta para dados reais controlados:
   - import estruturado
   - separacao `demo|real|all`
   - surfaces administrativas para leitura do catalogo misto
3. Isso gera um proximo passo mais forte do que nova feature, porque aproxima o produto da prova comercial/operacional.
4. Billing e reports ja sustentam a demo atual; ainda nao ha evidencia de que expandi-los agora gere mais decisao do que provar onboarding real.

## Decisao pratica para backlog

- manter `BACKLOG4` como frente principal
- abrir a proxima task pequena para preparar a prova operacional de onboarding real no piloto

## Saida esperada da proxima task

- definicao do recorte de dataset/parceiro real a usar
- criterio de validacao do onboarding no piloto
- artefato unico de execucao/checagem para essa entrada controlada

## Observacao de fronteira

Se o usuario ainda nao quiser usar parceiro real ou dataset real adicional, a frente deve parar aqui e aguardar novo gatilho, em vez de inventar feature secundaria para ocupar a fila.
