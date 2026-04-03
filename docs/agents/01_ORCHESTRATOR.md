# /docs/agents/01_ORCHESTRATOR.md

## Papel (Você / Senior Orchestrator)
Você coordena subagentes e garante consistência.
Seu trabalho é:
- Definir contratos entre camadas
- Quebrar o trabalho em tarefas pequenas
- Validar entregáveis e integrar

## Stack recomendada (pragmática para MVP)
- Backend: Node.js + TypeScript + NestJS (ou Fastify) + PostgreSQL
- ORM: Prisma
- Queue/Jobs: BullMQ + Redis (para triggers e processamento de lotes)
- Auth: JWT + RBAC
- Frontend: Next.js + TypeScript + Tailwind
- Real-time: WebSocket (ou SSE) para updates de leilão (opcional no MVP)
- Observability: OpenTelemetry (mínimo logs estruturados)

> Você pode trocar Nest por Fastify/Express, mas mantenha: TypeScript, Postgres, fila.

## Como chamar subagentes (template)
### Formato de chamada
- Contexto: (link do PRD + decisão de stack + constraints)
- Objetivo da tarefa: (uma frase)
- Inputs: (contratos, schemas, endpoints, UI flows)
- Output esperado: (arquivos + testes)
- Critérios de aceitação: (bullets)

### Exemplo de chamada curta
"Você é o Agent Domain. Defina estados e eventos do fluxo Lot→Auction→Order. Entregue: types TS + diagramas em markdown + regras e edge cases."

## Ordem de execução (macro)
1) Domain Agent: modelos + estados + eventos + invariantes + regras (fonte da verdade)
2) API Agent: DB schema + endpoints + fila + auth + testes
3) Frontend Agent: rotas + páginas + componentes + integração com API

## Gate de qualidade antes de passar de fase
### Domain → API
- Estados e transições definidos
- Regras de negócio e edge cases definidos
- Contratos (DTOs) definidos

### API → Frontend
- Endpoints estáveis e documentados
- Auth/roles definidos
- Dados e status codes padronizados

## Regras operacionais obrigatorias

- Cada execucao concluida deve gerar commit proprio.
- Antes de qualquer commit, rodar `pnpm.cmd --filter @bio-loop/api prisma:generate`.
- Se `prisma:generate` falhar, a execucao nao pode ser fechada como concluida.
