# B5-04 - Auth Production Cookie/Domain Decision

## Status

DECIDED em 2026-05-01.

## Problema real

O deploy de vitrine esta publicado com Web na Vercel e API na Railway:

- Web: `https://bio-loop-orchestrator-web.vercel.app`
- API: `https://bio-loop-orchestrator-production.up.railway.app`

A investigacao de 2026-04-20 confirmou que:

- CORS permite a origem da Web da Vercel.
- O preflight de `POST /auth/login` passa.
- `GET /auth/csrf` emite `csrf_token` e retorna o mesmo token no body.
- A API valida CSRF quando `csrf_token` e `X-CSRF-Token` chegam juntos.
- O login no browser permanece bloqueado porque o cookie `csrf_token` nao e reenviado no `POST /auth/login` entre dominios Vercel e Railway.

Conclusao: o problema nao e divergencia de contrato de auth, body, header, CORS ou validador CSRF. O problema e operacional de dominio/cookie no browser em contexto cross-site.

## Opcoes consideradas

### Opcao A - Manter dominios gerenciados Vercel/Railway com `SameSite=None`

Resultado esperado: continuar dependendo de cookies cross-site/third-party entre `vercel.app` e `up.railway.app`.

Decisao: rejeitada para desbloquear auth browser.

Motivo: e exatamente o estado que esta bloqueado no browser. Mesmo com `COOKIE_SECURE=true`, `COOKIE_SAMESITE=None`, CORS correto e `credentials: include`, a confiabilidade depende da politica de third-party cookies do navegador.

### Opcao B - Colocar Web e API sob dominio same-site controlado

Exemplo operacional:

- Web em `https://app.<dominio-controlado>`
- API em `https://api.<dominio-controlado>`

Resultado esperado: Web e API deixam de operar como sites distintos para a politica de SameSite do browser, mantendo servicos separados e preservando CORS, cookies httpOnly e CSRF.

Decisao: recomendada.

Motivo: resolve a causa observada sem reescrever auth, sem alterar UI, sem trocar arquitetura da API e sem depender de third-party cookies.

### Opcao C - Proxy/BFF para expor a API sob a mesma origem da Web

Resultado esperado: chamadas do browser poderiam sair pela origem da Web e serem encaminhadas para a API.

Decisao: nao recomendada para o proximo passo.

Motivo: aumenta acoplamento operacional entre Web e API, pode esconder problemas reais de CORS/cookie, complica `/reference` e smoke direto da API, e foge da arquitetura validada de servicos separados.

### Opcao D - Remover CSRF ou trocar o fluxo de auth

Resultado esperado: evitaria a dependencia do cookie CSRF atual.

Decisao: fora de escopo e rejeitada.

Motivo: o fluxo atual ja foi validado quando cookie e header chegam juntos. Remover CSRF ou redesenhar auth criaria risco de seguranca e refactor desnecessario.

## Estrategia recomendada

Configurar dominio same-site controlado para Web e API, mantendo os servicos separados:

- Web: `https://app.<dominio-controlado>` ou `https://<dominio-controlado>`
- API: `https://api.<dominio-controlado>`
- ambos em HTTPS
- CORS da API limitado a origem final da Web
- cookies emitidos pela API em contexto same-site

Configuracao operacional recomendada:

### Web

| Variavel | Valor recomendado |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.<dominio-controlado>` |
| `APP_URL` | URL final da Web, por exemplo `https://app.<dominio-controlado>` |
| `NODE_ENV` | `production` |

### API

| Variavel | Valor recomendado |
| --- | --- |
| `APP_URL` | URL final da Web, por exemplo `https://app.<dominio-controlado>` |
| `ALLOWED_ORIGINS` | URL final da Web |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAMESITE` | `Lax` |
| `COOKIE_DOMAIN` | vazio/host-only |
| `TRUST_PROXY` | `true` |

`COOKIE_DOMAIN` deve ficar vazio inicialmente. Como os cookies sao emitidos pela API e reenviados para a propria API, cookie host-only reduz superficie de exposicao entre subdominios. Usar `.<dominio-controlado>` so deve ser considerado se houver necessidade operacional real de compartilhar cookies entre subdominios, com nova revisao.

## Criterio de validacao futura

A validacao deve ser feita no browser real depois do setup de dominio:

- `GET /auth/csrf` retorna `200`.
- Browser armazena `csrf_token` emitido pela API.
- `POST /auth/login` envia cookie `csrf_token` e header `X-CSRF-Token`.
- Login buyer, seller e admin funciona em producao.
- Refresh/session hydration funciona apos reload.
- Logout limpa a sessao de forma observavel.
- `/health`, `/readiness`, `/openapi.json` e `/reference` continuam acessiveis.

## Riscos

- Configuracao incorreta de DNS/TLS pode trocar um bloqueio de cookie por falha de origem ou certificado.
- `ALLOWED_ORIGINS` precisa acompanhar exatamente a URL final da Web.
- `COOKIE_SAMESITE=Lax` depende de Web e API estarem no mesmo site registravel e no mesmo esquema HTTPS.
- `COOKIE_DOMAIN` amplo demais pode aumentar exposicao entre subdominios sem necessidade.
- A mudanca deve ser validada em browser real; cliente HTTP nao substitui a evidencia do problema observado.

## Non-goals

- Nao executar deploy.
- Nao configurar DNS, Vercel, Railway ou provider.
- Nao alterar codigo de auth.
- Nao alterar UI.
- Nao refatorar API.
- Nao trocar o contrato CSRF.
- Nao abrir `BACKLOG7`.
- Nao promover nova task para `READY` automaticamente.

## Proxima task recomendada

`DEPLOY-02 - Same-site domain setup for production auth`.

Status recomendado: `CANDIDATA`, nao `READY`.

Motivo: depende de novo gatilho explicito para executar configuracao real de dominio/envs e validacao operacional sem secrets.
