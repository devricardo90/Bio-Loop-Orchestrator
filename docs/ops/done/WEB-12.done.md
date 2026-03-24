# [DONE] WEB-12 UX operacional conectada ao `/reference`

## O que foi entregue

- acesso global ao `/reference` adicionado no header do web
- painel contextual reutilizavel criado para buyer, pickup, admin buyers, admin disputes e seller billing
- cada workspace agora aponta explicitamente para os endpoints mais relevantes do fluxo operacional atual
- o web tambem expõe acesso direto ao `openapi.json` para troubleshoot e release review

## Gate executado

- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd test:e2e`: FAIL (`spawn EPERM` no ambiente local ao iniciar Playwright)

## Resultado pratico

- a navegacao entre UI operacional e docs vivas da API ficou direta e sem ambiguidade
- buyer, seller e admin conseguem cruzar comportamento da tela com contrato da API sem sair do fluxo de validacao manual
- o proximo passo natural e fechar o polish final de labels, navegacao e consistencia para o piloto manual
