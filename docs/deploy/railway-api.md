# Railway API Deploy Prep

## Escopo

Preparacao interna para deploy do `apps/api` no Railway.

Esta nota nao cria recurso externo, nao define secrets reais e nao faz deploy.

## Decisao de arquitetura

O `apps/api` deve subir como servico separado do `apps/web`.

Nao converter a API Nest para Vercel Functions.

Nao remover Postgres, Redis ou Prisma.

## Root directory no Railway

Usar a raiz do repositorio como root directory.

Valor recomendado no Railway:

```text
/
```

Nao usar `apps/api` como root directory.

Motivo:

- `apps/api/package.json` depende de `@bio-loop/domain` e `@bio-loop/shared` com `workspace:*`.
- O `pnpm-workspace.yaml` fica na raiz.
- O `pnpm-lock.yaml` fica na raiz.
- O build da API precisa enxergar os pacotes internos em `packages/*`.

## Por que `npm install` falha

O `apps/api/package.json` contem:

```json
"@bio-loop/domain": "workspace:*",
"@bio-loop/shared": "workspace:*"
```

`workspace:*` e protocolo de workspace usado pelo pnpm neste monorepo. Se Railway/Nixpacks tentar instalar com `npm install`, o npm nao resolve esse protocolo no contexto esperado e falha com:

```text
Unsupported URL Type "workspace:"
```

A solucao correta e garantir install/build com pnpm a partir da raiz do monorepo, nao trocar as dependencias internas por versoes publicadas e nao rodar npm dentro de `apps/api`.

## Precisa Dockerfile?

Nao neste momento.

O repo ja tem:

- `packageManager: pnpm@9.15.4`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- scripts filtrados por workspace
- `.node-version` com Node `24`

Configuracao correta no Railway deve bastar:

- root directory: raiz do repo
- package manager: pnpm
- custom build command
- custom start command

Criar Dockerfile so deve ser considerado se o Railway continuar ignorando pnpm/root ou se houver necessidade operacional de empacotar Prisma/migrations de forma mais controlada.

## Runtime Node

O repo declara:

```json
"engines": {
  "node": "24.x",
  "pnpm": "9.x"
}
```

O arquivo `.node-version` fixa:

```text
24
```

## Comando de build para Railway

Usar a raiz do monorepo como working directory.

Se o Railway tentar usar `npm install`, configurar tambem o install command:

```bash
pnpm install --frozen-lockfile
```

Build command:

```bash
pnpm --filter @bio-loop/api prisma:generate && pnpm --filter @bio-loop/api build
```

Se o ambiente Railway nao aplicar migrations automaticamente, executar antes do primeiro runtime contra banco novo:

```bash
pnpm --filter @bio-loop/api exec prisma migrate deploy --schema prisma/schema.prisma
```

Nao colocar seed/import real automaticamente no build. Seed e import devem ser acao operacional explicita.

## Comando de start para Railway

Start command recomendado:

```bash
node apps/api/dist/main.js
```

Motivo:

- `apps/api/package.json` define `start` como `node dist/main.js`.
- Como o Railway vai rodar a partir da raiz do repo, o caminho direto correto para o artefato da API e `apps/api/dist/main.js`.
- Iniciar Node diretamente evita que o package manager vire o processo principal do container.

Evitar como start command principal:

```bash
pnpm --filter @bio-loop/api start
```

Esse comando e valido localmente, mas em plataforma gerenciada o processo principal deveria ser `node`, nao `pnpm`.

## Envs da API

### Lidas diretamente pelo codigo da API

| Variavel | Motivo |
| --- | --- |
| `PORT` | Railway normalmente injeta; a API le `API_PORT` ou `PORT` |
| `APP_URL` | origem Web publica, tambem adicionada ao CORS |
| `ALLOWED_ORIGINS` | lista de origens Web permitidas para CORS |
| `DATABASE_URL` | Prisma/Postgres |
| `COOKIE_SECURE` | deve ser `true` em HTTPS |
| `COOKIE_SAMESITE` | geralmente `None` quando Web/API forem cross-site |
| `TRUST_PROXY` | deve ser `true` atras de proxy gerenciado |
| `COOKIE_DOMAIN` | opcional; usado apenas quando dominio compartilhado estiver definido |
| `OPENAPI_ENABLED` | habilita/desabilita `/openapi.json` |
| `REFERENCE_ENABLED` | habilita/desabilita `/reference` |
| `JOB_SWEEP_INTERVAL_MS` | intervalo do scheduler in-process |
| `JOB_INITIAL_DELAY_MS` | atraso inicial do scheduler in-process |
| `JOB_MAX_ATTEMPTS` | tentativas maximas dos jobs |
| `JOB_MAX_FAILURE_STREAK` | limite de falhas antes de worker degradado |
| `JOB_STALE_AFTER_MS` | limite de stale worker |

### Obrigatorias para runtime de vitrine

| Variavel | Motivo |
| --- | --- |
| `NODE_ENV` | convencao de runtime; usar `production` |
| `PORT` | Railway injeta e a API le como fallback de porta |
| `APP_URL` | origem Web publica, tambem adicionada ao CORS |
| `ALLOWED_ORIGINS` | lista de origens Web permitidas para CORS |
| `DATABASE_URL` | Prisma/Postgres |
| `COOKIE_SECURE` | deve ser `true` em HTTPS |
| `COOKIE_SAMESITE` | geralmente `None` quando Web/API forem cross-site |
| `TRUST_PROXY` | deve ser `true` atras de proxy gerenciado |

### Obrigatorias no build

| Variavel | Motivo |
| --- | --- |
| `DATABASE_URL` | Prisma CLI/schema usa `env("DATABASE_URL")`; necessario para migrate deploy e pode ser exigido por comandos Prisma |

### Mantidas por politica de deploy, mas nao lidas pela API atual

| Variavel | Motivo |
| --- | --- |
| `REDIS_URL` | faz parte do contrato operacional de deploy com Redis, embora o codigo atual nao leia diretamente essa env |
| `JWT_ACCESS_SECRET` | esta no `.env.example`, mas o codigo atual usa tokens gerados em memoria e nao le essa env diretamente |
| `JWT_REFRESH_SECRET` | esta no `.env.example`, mas o codigo atual usa tokens gerados em memoria e nao le essa env diretamente |
| `JWT_ACCESS_TTL_MIN` | esta no `.env.example`; TTL atual esta hardcoded no controller |
| `JWT_REFRESH_TTL_DAYS` | esta no `.env.example`; TTL atual esta hardcoded no controller |

### Preenchiveis depois / opcionais

| Variavel | Padrao atual | Quando preencher |
| --- | --- | --- |
| `API_PORT` | fallback local `4000` | normalmente nao precisa no Railway se `PORT` for injetado |
| `API_URL` | sem uso direto no codigo da API atual | util como referencia operacional/documental |
| `COOKIE_DOMAIN` | vazio em producao ate dominio final | usar apenas com dominio compartilhado controlado |
| `JWT_ACCESS_TTL_MIN` | `15` no codigo/env local | ajustar se houver politica diferente |
| `JWT_REFRESH_TTL_DAYS` | `14` no codigo/env local | ajustar se houver politica diferente |
| `OPENAPI_ENABLED` | `true` quando omitido | manter `true` para vitrine |
| `REFERENCE_ENABLED` | `true` quando omitido | manter `true` para vitrine |
| `JOB_SWEEP_INTERVAL_MS` | `60000` | ajustar apenas se necessario |
| `JOB_INITIAL_DELAY_MS` | `5000` | ajustar apenas se necessario |
| `JOB_MAX_ATTEMPTS` | default interno | ajustar apenas se necessario |
| `JOB_MAX_FAILURE_STREAK` | default interno | ajustar apenas se necessario |
| `JOB_STALE_AFTER_MS` | default interno | ajustar apenas se necessario |

### Nao sao envs da API em Railway

Estas sao para Web ou Docker local:

- `NEXT_PUBLIC_API_URL`
- `WEB_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

## Operacoes manuais apos provisionar banco

Primeiro deploy contra banco vazio:

```bash
pnpm --filter @bio-loop/api exec prisma migrate deploy --schema prisma/schema.prisma
```

Gerar dados demo:

```bash
node apps/api/prisma/seed.mjs
```

Dry-run do dataset real:

```bash
node apps/api/prisma/import-real-data.mjs
```

Apply do dataset real:

```bash
node apps/api/prisma/import-real-data.mjs --apply
```

## Smoke minimo da API no Railway

Depois do deploy:

```text
GET https://<api-service>.up.railway.app/health
GET https://<api-service>.up.railway.app/readiness
GET https://<api-service>.up.railway.app/reference
GET https://<api-service>.up.railway.app/openapi.json
```

Resultado esperado:

- `/health`: HTTP 200
- `/readiness`: HTTP 200 e database ready
- `/reference`: Scalar carrega
- `/openapi.json`: JSON OpenAPI carrega

## Status

DONE para baseline de vitrine em 2026-04-15.

Estado registrado:

- API publicada na Railway em `https://bio-loop-orchestrator-production.up.railway.app`
- Postgres ativo na Railway
- Redis ativo na Railway
- `/health` validado
- `/readiness` validado
- `/reference` validado
- `/openapi.json` validado
- CORS validado para `https://bio-loop-orchestrator-web.vercel.app`
- Auth CSRF validado quando cookie `csrf_token` e header `X-CSRF-Token` chegam juntos

Pendencias nao bloqueantes:

- registrar commit SHA exato associado ao deploy validado, se necessario
- manter seed/import real como acao operacional explicita
- reavaliar exposicao de `/reference` e `/openapi.json` antes de ambiente publico mais amplo
- resolver bloqueio de login no browser causado por cookie CSRF cross-site nao reenviado entre Vercel e Railway
