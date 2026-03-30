# UX Friction Inventory

## Objetivo

Registrar as principais friccoes e ambiguidades de interface observaveis na baseline atual, sem misturar este checkpoint com refactor tecnico ou redesign amplo.

## Escopo desta leitura

- jornada buyer
- jornada seller
- jornada admin
- handoff principal em `/`
- shell comum de navegacao e orientacao

## Regra de interpretacao

- os itens abaixo sao friccoes de leitura, hierarquia, orientacao ou clareza
- nao sao automaticamente bugs
- qualquer problema estrutural futuro deve ser redirecionado para `BACKLOG5`
- qualquer redesign amplo deve esperar o criterio formal de Figma Ready

## Friccoes por jornada

### Handoff principal em `/`

#### Friccoes observadas

- o handoff principal explica bem a ordem da demo, mas ainda assume familiaridade previa com buyer, seller e admin
- a tela e forte como roteiro de operador, mas menos forte como porta de entrada para um visitante sem contexto
- o link direto para `Live auction` concorre um pouco com a narrativa principal por role e pode induzir salto prematuro no fluxo

#### Leitura de impacto

- impacto maior em primeira impressao e orientacao inicial
- baixo risco operacional
- alto potencial de melhoria de clareza sem tocar contrato tecnico

### Jornada buyer

#### Friccoes observadas

- a prova de valor do buyer depende de o operador explicar manualmente por que `source=api` importa
- o fluxo feed -> live auction -> pickup e forte, mas o motivo de cada passo ainda nao esta totalmente autoexplicativo na interface
- buyer concentra a jornada mais transacional, enquanto seller e admin sao mais de leitura; isso torna a experiencia geral um pouco assimetrica sem orientacao adicional

#### Leitura de impacto

- impacto direto em demonstracao de valor
- risco moderado de confusao em audiencia nova
- melhoria futura deve priorizar contexto e hierarquia, nao novos fluxos

### Jornada seller

#### Friccoes observadas

- seller esta claro como segundo passo da demo, mas o valor de negocio de `lots`, `results` e `reports` ainda depende de narrativa do operador
- a diferenca entre visao operacional corrente e visao de resultado historico pode nao ficar obvia de primeira
- a jornada seller e mais consultiva do que orientada a acao, o que pode fazer a experiencia parecer menos “viva” que buyer

#### Leitura de impacto

- impacto maior em percepcao de valor do seller
- baixo risco tecnico
- alto potencial de melhoria por organizacao de informacao e hierarquia visual

### Jornada admin

#### Friccoes observadas

- admin fecha bem a narrativa, mas exige contexto previo para entender por que `catalogScope` e badges de dataset importam
- buyer approvals e dispute queue sao bons pontos finais, porem a relacao entre governanca e operacao pode ficar implicita demais
- o papel do admin como “fechamento do loop” esta melhor no discurso da demo do que na autoexplicacao da tela

#### Leitura de impacto

- impacto moderado em demonstracao guiada
- impacto maior em apresentacao para audiencia nao tecnica
- melhoria futura deve focar linguagem, agrupamento e narrativa de fechamento

## Friccoes transversais

### Hierarquia de contexto

- o produto ja tem boa navegacao por role, mas ainda depende do operador para conectar as tres areas como partes de uma mesma historia
- falta uma camada mais explicita de “onde estou nesta historia” em algumas superficies internas

### Assimetria entre jornadas

- buyer demonstra fluxo e continuidade
- seller e admin demonstram leitura, controle e fechamento
- essa assimetria nao e ruim, mas exige UX deliberada para parecer intencional e nao desigual

### Dependencia de explicacao verbal

- a baseline atual esta forte para demo assistida
- ainda nao esta tao forte para exploracao autoexplicativa sem mediacao

## Itens que nao devem virar acao agora

- qualquer refactor de runtime seller/admin
- qualquer alteracao de contrato API para acomodar UX
- qualquer redesign amplo sem criterio formal de priorizacao

## Direcao recomendada para a proxima etapa

- formalizar o criterio de `Figma Ready`
- separar modulos maduros para refinamento de experiencia
- congelar modulos que ainda dependem de decisao estrutural futura
