# Pilot Dry Run V2 - Rodada 2 Assistida

## Objetivo
Consolidar a captura estruturada de sinais de uso real (Buyer, Seller e Admin) com base no estado validado atual (pós-M9). Este artefato registra evidências não maquiadas para orientar o destino da próxima frente de trabalho (Produto, Hardening ou UX).

## Evidência Executada
- Ensaio simulado da navegação de ponta a ponta nas três personas pelo Orquestrador usando o ambiente local local (`http://localhost:3001`).
- O roteiro de `PILOT_DEMO_SCRIPT.md` e o Operator Handoff Card foram testados visualmente no navegador.
- Nenhuma alteração técnica ou refactor de componente foi induzido em tempo de ensaio para cobrir bugs. O estado relatado é fiel ao construído.

## Findings Capturados (Sinais de Atrito)

### `[OPERAÇÃO]`
- **Inconsistência de leitura de status:** No feed do comprador, o lote de teste (ex: "Apple Pomace") aparece anunciado em destaque (Spotlight) como estado `LIVE`, enquanto a listagem logo abaixo classifica o mesmo lote fisicamente como `SCHEDULED`. Cria uma quebra grave de confiança narrativa durante a apresentação de um leilão para o cliente.

### `[UX]`
- **Poluição Visual (Timeline Quebrada):** Ao visualizar resultados e transições no workspace do *seller* ("Brewer's husk"), o renderizador duplicou a etapa de "Upcoming stage" repetidas vezes no componente, alongando a tela verticalmente.
- **Layout Confinado:** No banner principal de leilão do *buyer*, o CTA mestre ("Open live auction") carece de espaçamento inferior (padding/margin break), parecendo apertado e quase cortado na base do contêiner.
- **Feedback Ausente em Ações Bloqueadas:** O botão crítico da persona de *buyer* ("Place bid") carrega já na sua forma inativa/cinza, sem exibir nenhum tooltip ou texto explicativo de rodapé instruindo o usuário do motivo deste bloqueio funcional instantâneo (ausência de montante, leilão pausado, etc).

### `[TÉCNICA]`
- **Parsing Pobre de Dados:** Exibição literal da falha `"Invalid Date"` no log/histórico de lances da interface. Uma falha de tratamento (date formatting) quando os dados vêm indefinidos da API persistida ou no lado cliente do formato Next.js.
- **Disparos Pré-Reidratação / Sessão:** Captura de disparos retornando erro `401 Unauthorized` provenientes do polling do feed *no mesmo exato segundo* de inicialização da visão. O App eventualmente lida e se recupera puxando a view em seguida, mas é um comportamento custoso e sujo (race-condition de login vs fetch).
- **Peso de Carregamento (Mismatch):** Atrito gerado em tempo longo e aparente na tela amarela/branca travada em "Loading session...". Além da lentidão percebida sem necessidade, o console da aplicação grita *Hydration Mismatch* proveniente da dissonância natural do SSR.

## Resumo Analítico e Impacto
A estrutura primária de dados do M9 suporta muito bem a existência paralela de demos e vida real. Os `filters` de catálogo funcionaram. A alternância de navegação funciona, **isso sem dead-ends estressantes.** No entanto:
- As deficiências que existem **não são puras faltas de features de roteiro ou produto em si** (não sugerem expansões imediatas de painéis em `BACKLOG4`). 
- As queixas mais sonoras batem no "olho" (UI entalada, inconsistências falsas listadas na capa, falsos loading longos).

## Decisão e Recomendação Oficial do Piloto

O sinal extraído encoraja categoricamente a pausar/congelar temporariamente os esforços amplos da frente `BACKLOG4` (Produto) e mirar nossos canhões para as frentes paralelas:

1. **Recomendado ativar BACKLOG6 (Experiência/UX):** Com caráter imediato apenas para os reparos cirúrgicos validados: dar respiro e sanidade à *Timeline*, acertar o padding do banner e criar lógica clara de *disabled reason* no botão de bid.
2. **Recomendado reativar BACKLOG5 (Hardening):** Para estancar o vazamento silencioso de request 401 prematuro no polling do feed, unificar os tratadores silenciosos da string de Data e erradicar o `Hydration Mismatch`.
