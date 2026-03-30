# Pilot Demo Dry Run

## Objetivo

Registrar o ensaio controlado da demo apos a primeira rodada curta de `BACKLOG4`, deixando explicitos os achados reais antes de ampliar a frente.

## Evidencia executada

- `pnpm.cmd test:e2e`: PASS

Cobertura observada no ensaio:

- buyer login e live auction
- seller guard e seller reports
- admin buyers e disputes
- buyer real-data feed -> auction detail -> pickup detail
- handoff de sessao expirada

## Findings reais desta rodada

### Finding 1 - Flake de sincronizacao no helper de login do e2e
- tipo: teste
- impacto: o seller login podia falhar de forma intermitente no dry-run automatizado
- causa: o helper clicava a persona e submetia antes de garantir que o email da persona estava refletido no formulario
- acao tomada: `tests/e2e/helpers.ts` agora aguarda o email correto antes do submit
- status: resolvido

### Finding 2 - Drift de assertion apos ajuste de copy em seller overview
- tipo: teste
- impacto: o e2e de route guard seller falhava mesmo com a navegacao correta
- causa: a assertion do heading ainda apontava para o texto antigo
- acao tomada: `tests/e2e/auth.e2e.spec.ts` atualizado para a copy nova aprovada em `B4-03`
- status: resolvido

## Conclusao do ensaio

- o fluxo de demo permanece saudavel
- o ensaio nao deixou blocker funcional aberto em buyer, seller ou admin
- os achados desta rodada foram restritos a robustez/alinhamento da suite automatizada

## Proximo passo recomendado

- condensar o roteiro e o checklist em um artefato unico para uso ao vivo (`B4-05`)
