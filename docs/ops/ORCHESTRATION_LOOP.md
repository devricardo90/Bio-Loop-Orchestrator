# ORCHESTRATION_LOOP.md

## Objetivo

Definir a dinâmica do Agente Orquestrador: como ele escolhe tarefas, chama subagentes e decide quando avançar.

---

## Loop diário (sempre igual)

1. Ler /docs/ops/STATUS.md (o que está pronto e o que falta).
2. Ler /docs/ops/BACKLOG.md e pegar o 1º item "READY".
3. Preparar "Task Brief" (contexto + input + output + aceitação).
4. Chamar subagente (Domain/API/Frontend/Infra/QA) com o brief.
5. Receber entregáveis -> rodar Gate.
6. Se Gate OK: merge -> atualizar STATUS + marcar backlog como DONE.
7. Se Gate falhar: criar tarefa "FIX" e voltar ao passo 2.

---

## Gatilhos para avançar (Gates)

### Gate A Domain -> API

- types.ts existe e compila
- stateMachine.md revisado
- rules.md cobre edge cases
- schemas zod definidos (request/response)

### Gate B API -> Frontend

- endpoints documentados (OpenAPI)
- auth httpOnly funcionando em dev
- contrato zod no client validando responses
- testes de integração do fluxo principal (LotAuctionBidOrder)

### Gate C Release MVP Slice

- CI verde (lint/typecheck/test)
- seed/demo data funcionando
- fluxos buyer + seller navegáveis sem dead-ends

### Regra obrigatória para Prisma (Pré-commit e uso de API)

- O orquestrador DEVE rodar `pnpm.cmd --filter @bio-loop/api prisma:generate` ANTES de qualquer commit no repositório E ANTES de executar qualquer passo que dependa/use a API.
- Não fazer commit nem push de qualquer mudança sem antes executar `prisma:generate` com sucesso.
- Se `prisma generate` falhar por bloqueio de rede/engine, isso deve ser tratado como gate pendente, não como tarefa concluída.

---

## Como o orquestrador monta um Task Brief

Sempre inclui:

- Contexto (milestone + PRD + contratos relevantes)
- Objetivo (1 frase)
- Inputs (arquivos existentes, endpoints, schemas, regras)
- Output esperado (lista de arquivos e comportamentos)
- Critérios de aceitação (checklist)
- "Do not break" (não quebrar estados/contratos existentes)

---

## Subagentes (especialidades)

- Domain Agent: estados, regras, contratos, DTOs/zod
- API Agent: DB, endpoints, auth, jobs/queues, OpenAPI, testes
- Frontend Agent: rotas, telas, integração, estados, polling
- Infra Agent: docker, CI, migrations, env, observability
- QA Agent: testes e2e, cenários edge, checklist de release
