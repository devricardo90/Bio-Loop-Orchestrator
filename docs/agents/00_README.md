# /docs/agents/00_README.md

## Objetivo
Este diretório define:
- Como orquestrar agentes (subagentes especialistas)
- A ordem de construção: Lógica/Domain → API → Frontend
- Prompts e padrões de entrega (output) para cada agente

## Regras de ouro
1) Nada de “inventar” comportamento: tudo deve virar contrato (estado, evento, regra, endpoint).
2) Cada tarefa termina com: PR pronto + checklist + testes mínimos.
3) Sempre trabalhar com "vertical slices" pequenas (ex.: Lot + Auction + Bid flow) antes de expandir.

## Definições (glossário)
- Seller: supermercado/loja
- Buyer: indústria (ração/cervejaria/bioprocessamento)
- Lot: lote aglutinado vendável
- Auction: leilão do lote
- Order: contrato/ordem gerada após vitória
- POD: proof of delivery / proof of pickup (confirmação de coleta)

## Saídas padrão (para todo agente)
- Arquivos criados/modificados (lista)
- Decisões tomadas (com justificativa curta)
- Pontos em aberto (se houver)
- Testes rodados / como rodar
