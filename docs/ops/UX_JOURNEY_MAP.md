# UX Journey Map

## Objetivo

Mapear as jornadas reais buyer, seller e admin sobre a baseline atual, criando uma base objetiva para o checkpoint de UX/Figma.

## Entrada comum

- ponto de entrada principal: `/`
- autenticacao por role em `/login`
- navegacao protegida por guards de workspace
- acesso transversal a `/reference`

## Jornada Buyer

### Entrada

- login como `buyer`
- redirecionamento para `/buyer/feed`

### Caminho principal

1. abrir feed
2. confirmar `source=api`
3. abrir leilao ao vivo
4. navegar para pickup queue
5. abrir pickup detail

### Objetivo de uso

- provar que o caminho principal buyer esta ancorado em dados reais da API
- demonstrar continuidade entre feed, auction detail e pickup

### Superficies envolvidas

- `/buyer/feed`
- `/buyer/auctions/[id]`
- `/buyer/orders`
- `/buyer/orders/[id]`

### Pontos fortes atuais

- narrativa operacional clara
- `source=api` exposto
- `/reference` conectado ao fluxo
- continuidade validada por e2e real-data

## Jornada Seller

### Entrada

- login como `seller`
- redirecionamento para `/seller`

### Caminho principal

1. abrir seller overview
2. navegar para lots
3. navegar para results
4. abrir reports

### Objetivo de uso

- mostrar a leitura seller da mesma baseline validada
- demonstrar lots, outcomes e reports sem ambiguidade operacional

### Superficies envolvidas

- `/seller`
- `/seller/lots`
- `/seller/lots/[id]`
- `/seller/results`
- `/seller/reports`

### Pontos fortes atuais

- narrativa de demo alinhada em `B4-03`
- route guard validado
- reports/export presentes
- fluxo consistente com buyer/admin

## Jornada Admin

### Entrada

- login como `admin`
- redirecionamento para `/admin`

### Caminho principal

1. abrir admin overview
2. navegar para buyers
3. usar `catalogScope`
4. confirmar badges `real` e `demo`
5. navegar para disputes

### Objetivo de uso

- fechar a demonstracao com buyer approvals, disputes e leitura de dataset
- mostrar separacao clara entre dados demo e reais

### Superficies envolvidas

- `/admin`
- `/admin/buyers`
- `/admin/disputes`

### Pontos fortes atuais

- `catalogScope` visivel
- disputes e buyers navegaveis
- `/reference` continua acessivel
- papel de fechamento da narrativa esta claro

## Shell comum

### Elementos compartilhados relevantes para UX

- handoff principal em `/`
- login por role
- header com navegacao contextual
- acesso a `/reference`
- estados operacionais ja trabalhados em buyer/seller/admin

## Leitura inicial para checkpoint de UX

- buyer e a jornada mais forte para provar valor funcional
- seller e admin ja tem narrativa operacional clara, mas dependem mais de leitura e hierarquia do que de fluxo transacional intenso
- o projeto esta pronto para a proxima etapa de leitura de friccoes, mas ainda nao para redesign amplo sem priorizacao
