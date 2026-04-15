# B4-16 - Assisted Demo Script

## Status

- Consolidado em: 2026-04-14
- Frente: `BACKLOG4` - Piloto / Produto / Operacao
- Tipo: roteiro assistido de demonstracao

## Objetivo

Transformar o Evidence Pack da `B4-15` em um roteiro pratico, curto e reproduzivel para demonstrar o piloto como produto observavel.

## Principio da demo

A demo deve provar o que o piloto ja sustenta hoje:

- runtime local previsivel
- autenticacao real por role
- buyer operando com dados vindos da API
- seller navegando operacao, resultados e reports
- admin distinguindo catalogo `demo` e `real`
- endpoints `/health`, `/readiness` e `/reference` disponiveis

A demo nao deve corrigir problemas durante a execucao. Qualquer falha deve ser classificada e levada para decisao posterior.

## Tempo estimado

- Preflight operacional: 3 a 5 minutos
- Buyer: 5 a 7 minutos
- Seller: 4 a 6 minutos
- Admin: 5 a 7 minutos
- Fechamento e classificacao de sinais: 3 a 5 minutos

Tempo total esperado: 20 a 30 minutos.

## Preflight operacional

### Acao

1. Confirmar que a stack usa o profile documentado em `docs/ops/PILOT_RUNTIME_PROFILE.md`.
2. Abrir `http://localhost:4000/health`.
3. Abrir `http://localhost:4000/readiness`.
4. Abrir `http://localhost:4000/reference`.
5. Abrir `http://localhost:3001`.

### Ponto de fala

O piloto roda com portas e comandos previsiveis. Antes de demonstrar valor de produto, validamos que a base operacional esta saudavel e auditavel.

### Checkpoints

- `/health` responde `200`.
- `/readiness` nao aponta degradacao impeditiva.
- `/reference` abre e representa os contratos usados na demo.
- Web abre na porta documentada.

### HOLD se

- `/health` falhar.
- `/readiness` indicar bloqueio de dependencia essencial.
- `/reference` estiver indisponivel.
- a execucao exigir improviso fora do runtime profile.

## Fluxo 1 - Buyer

### Acao

1. Entrar como buyer seedado.
2. Abrir o buyer feed.
3. Confirmar que o feed exibe `source=api`.
4. Abrir uma auction detail.
5. Seguir para pickup/orders quando houver item aplicavel.
6. Apontar o acesso contextual a `/reference`.

### Ponto de fala

O buyer demonstra a demanda operacional do piloto: oportunidades vindas da API, detalhe navegavel e continuidade para pickup quando o fluxo chega em ordem.

### Checkpoints

- Login buyer funciona com usuario seedado.
- Feed carrega sem fallback inventado.
- `source=api` esta visivel.
- Auction detail abre com dados coerentes.
- Pickup/orders ficam acessiveis quando aplicavel.
- `/reference` esta conectado ao contexto da jornada.

### Perguntas que este bloco responde

- O buyer consegue usar o produto sem depender de dados locais inventados?
- A jornada principal e compreensivel sem explicacao tecnica longa?
- A continuidade feed -> detail -> pickup esta clara o suficiente para demo assistida?

### HOLD se

- login buyer falhar.
- `source=api` desaparecer.
- auction detail quebrar.
- route guard prender o usuario em estado ambiguo.

## Fluxo 2 - Seller

### Acao

1. Entrar como seller seedado.
2. Abrir `/seller`.
3. Revisar o overview operacional.
4. Abrir lots/results.
5. Abrir reports.
6. Executar ou demonstrar o caminho de export quando aplicavel.

### Ponto de fala

O seller demonstra a continuidade operacional do lado de oferta: o piloto permite acompanhar lotes, resultados e evidencias de report sem depender de uma narrativa externa ao sistema.

### Checkpoints

- Login seller funciona com usuario seedado.
- Overview abre sem estado morto.
- Lots/results ficam navegaveis.
- Reports abrem.
- Export de reports esta disponivel quando aplicavel.
- Nao ha fallback silencioso que contradiga a narrativa da demo.

### Perguntas que este bloco responde

- O seller entende o que aconteceu com os lotes?
- O fluxo oferece evidencia operacional exportavel?
- Existe algum ponto que pareca depender de explicacao manual excessiva?

### HOLD se

- login seller falhar.
- overview ou reports ficarem inacessiveis.
- export quebrar quando fizer parte da demonstracao.
- a tela induzir leitura errada sobre origem ou estado dos dados.

## Fluxo 3 - Admin

### Acao

1. Entrar como `platform.admin@bioloop.dev`.
2. Abrir admin buyers.
3. Demonstrar `catalogScope=demo`.
4. Demonstrar `catalogScope=real`.
5. Demonstrar `catalogScope=all` se for util para comparar convivencia.
6. Abrir admin disputes.
7. Apontar a relacao com a validacao de `B4-14`.

### Ponto de fala

O admin demonstra controle operacional: o piloto distingue catalogo demo e real, preserva o seed demo e expõe o dataset `sweden-supermarkets` importado de forma auditavel.

### Checkpoints

- Login admin funciona com usuario seedado.
- Buyers carregam.
- `catalogScope=real` retorna registros reais.
- Catalogo real nao sobrescreve o demo.
- Disputes carregam em leitura administrativa.
- A diferenca entre `demo`, `real` e `all` fica clara para o observador.

### Perguntas que este bloco responde

- O onboarding real ficou visivel para operacao?
- O admin consegue distinguir demo e real sem ambiguidade?
- A convivencia dos datasets e segura para uma demo assistida?

### HOLD se

- login admin falhar.
- `catalogScope=real` nao retornar o dataset real esperado.
- a tela misturar demo e real sem sinalizacao compreensivel.
- disputes/admin ficarem inacessiveis.

## Fechamento da demo

### Acao

1. Reabrir `/reference`.
2. Recapitular os checkpoints que passaram.
3. Registrar qualquer friccao como `PRODUTO`, `UX` ou `TECNICA`.
4. Declarar resultado da demonstracao como `PASS` ou `HOLD`.

### Ponto de fala

A demo nao termina com opiniao solta. Ela termina com uma leitura objetiva: o que foi provado, o que falhou e qual tipo de decisao deve acontecer depois.

## Criterios PASS

A demonstracao deve ser considerada `PASS` quando:

- runtime sobe conforme o profile documentado
- `/health`, `/readiness` e `/reference` sustentam a demonstracao
- auth por role funciona para buyer, seller e admin
- buyer exibe `source=api`
- seller navega overview, lots/results e reports sem dead-end
- admin demonstra catalogo `real` e convivencia com `demo`
- friccoes observadas, se houver, nao bloqueiam a narrativa principal
- nenhum ajuste tecnico e feito durante a demo

## Criterios HOLD

A demonstracao deve ser considerada `HOLD` quando:

- runtime exige improviso fora do profile
- `/health` ou `/readiness` bloqueiam a demo
- `/reference` esta indisponivel
- qualquer login seedado essencial falha
- buyer perde `source=api`
- admin nao acessa `catalogScope=real`
- seller/admin entram em dead-end operacional
- a origem demo/real fica ambigua para o observador

## Plano de contingencia

- Falha em `/health`: parar a demo e classificar como `TECNICA/runtime`.
- Falha em `/readiness`: registrar dependencia afetada e classificar como `TECNICA`.
- Falha em `/reference`: seguir apenas se os fluxos principais estiverem disponiveis, mas marcar como `HOLD`.
- Falha de login: parar a role afetada e classificar como `TECNICA/auth`.
- Falha em `source=api`: marcar `HOLD` e classificar como `TECNICA` ou `PRODUTO`, conforme causa observada.
- Falha em `catalogScope=real`: marcar `HOLD`; a prova pos-onboarding real fica comprometida.
- Friccao de leitura sem quebra funcional: registrar como `UX`.
- Gap de narrativa ou valor percebido: registrar como `PRODUTO`.

Nenhuma correcao deve ser feita durante a demonstracao.

## Saida esperada para B4-17

Ao final da execucao da demo, o operador deve levar para `B4-17`:

- resultado `PASS` ou `HOLD`
- checkpoints que passaram
- checkpoints que falharam
- gaps classificados como `PRODUTO`, `UX` ou `TECNICA`
- recomendacao inicial: seguir para piloto ampliado, pedir hardening tecnico, pedir ajuste UX ou manter como esta

`B4-17` continua dependente de novo gatilho explicito.
