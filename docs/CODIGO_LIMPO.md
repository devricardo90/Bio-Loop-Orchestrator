# CODIGO_LIMPO.md

## Regras

- Nao usar `any` no codigo.
- Preferir tipos explicitos, `unknown`, generics e unions bem definidos antes de relaxar tipagem.
- Se um valor vier dinamico ou externo, fazer parse/validacao na borda e converter para um tipo seguro.
- Nao esconder problema de modelagem com cast desnecessario.
- Nao duplicar contrato entre backend, frontend e banco se ele puder vir do dominio compartilhado.
- Nomear funcoes, tipos e variaveis pelo papel real no fluxo, nao por abreviacao vaga.
- Manter funcoes pequenas e com responsabilidade unica.
- Comentario so quando explica contexto ou decisao; nao comentar o obvio.
- Toda mudanca em API/Prisma deve manter `prisma:generate` no gate.
- Toda task executada pelo orquestrador deve terminar com commit proprio.
- Todo commit do orquestrador exige `pnpm.cmd --filter @bio-loop/api prisma:generate` executado com sucesso antes do commit.
- Nao encerrar execucao sem commit correspondente.

## Regra de tipagem

- `any` e proibido em codigo novo.
- Se existir codigo legado com `any`, o alvo e reduzir, isolar e remover aos poucos, nunca expandir.
- Quando nao houver tipo confiavel ainda:
  - usar `unknown`
  - validar com schema/type guard
  - converter para um tipo interno seguro

## Regra de revisao

- PR ou task nao fecha se introduzir `any` novo sem justificativa tecnica muito forte e temporaria.
- Solucao temporaria deve vir marcada com follow-up claro no backlog ou no report da task.
