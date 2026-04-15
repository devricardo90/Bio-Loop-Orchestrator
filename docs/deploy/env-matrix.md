# Deploy Env Matrix

## Principio

`apps/web` e `apps/api` sao servicos separados. A Web chama a API pelo browser usando `NEXT_PUBLIC_API_URL` e `credentials: "include"`.

Por isso, CORS e cookies precisam ser configurados com os dominios finais reais.

## Web env

| Variavel | Obrigatoria | Exemplo local | Producao |
| --- | --- | --- | --- |
| `NODE_ENV` | sim | `development` | `production` |
| `NEXT_PUBLIC_API_URL` | sim | `http://localhost:4000` | URL publica da API |
| `WEB_PORT` | local | `3001` | normalmente gerenciado pela plataforma |
| `APP_URL` | recomendado | `http://localhost:3001` | URL publica da Web |

## API env

| Variavel | Obrigatoria | Exemplo local | Producao |
| --- | --- | --- | --- |
| `NODE_ENV` | sim | `development` | `production` |
| `API_PORT` ou `PORT` | sim | `4000` | porta definida pela plataforma |
| `API_URL` | recomendado | `http://localhost:4000` | URL publica da API |
| `APP_URL` | sim | `http://localhost:3001` | URL publica da Web |
| `ALLOWED_ORIGINS` | sim | `http://localhost:3001` | origens Web permitidas, separadas por virgula |
| `TRUST_PROXY` | sim em plataforma proxy | `false` | `true` na maioria dos hosts gerenciados |
| `OPENAPI_ENABLED` | opcional | omitido = `true` | `true` para vitrine |
| `REFERENCE_ENABLED` | opcional | omitido = `true` | `true` para vitrine |

## Auth/cookie env

| Variavel | Obrigatoria | Exemplo local | Producao |
| --- | --- | --- | --- |
| `JWT_ACCESS_SECRET` | sim | `change_me` | secret forte gerado pelo operador |
| `JWT_REFRESH_SECRET` | sim | `change_me_too` | secret forte gerado pelo operador |
| `JWT_ACCESS_TTL_MIN` | sim | `15` | `15` ou valor decidido pelo operador |
| `JWT_REFRESH_TTL_DAYS` | sim | `14` | `14` ou valor decidido pelo operador |
| `COOKIE_SECURE` | sim | `false` | `true` em HTTPS |
| `COOKIE_SAMESITE` | sim | `Lax` | `None` se Web e API forem cross-site |
| `COOKIE_DOMAIN` | depende do dominio | `localhost` | somente se houver dominio compartilhado controlado |

## Banco e Redis

| Variavel | Obrigatoria | Exemplo local | Producao |
| --- | --- | --- | --- |
| `DATABASE_URL` | sim | `postgresql://...localhost:5453/...` | URL Postgres da plataforma escolhida |
| `REDIS_URL` | sim | `redis://localhost:6379` | URL Redis da plataforma escolhida |

## Jobs

| Variavel | Obrigatoria | Exemplo local | Producao |
| --- | --- | --- | --- |
| `JOB_SWEEP_INTERVAL_MS` | opcional | `60000` | manter padrao ou ajustar |
| `JOB_INITIAL_DELAY_MS` | opcional | `5000` | manter padrao ou ajustar |
| `JOB_MAX_ATTEMPTS` | opcional | omitido | definir se houver necessidade |
| `JOB_MAX_FAILURE_STREAK` | opcional | omitido | definir se houver necessidade |
| `JOB_STALE_AFTER_MS` | opcional | omitido | definir se houver necessidade |

## Local Docker only

Estas variaveis sao usadas pelo `docker-compose.yml` local e nao devem ser tratadas como secrets de app em plataformas gerenciadas, salvo se a propria plataforma pedir:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

## Politica cross-origin

Para Web e API em origens diferentes:

- `NEXT_PUBLIC_API_URL` deve apontar para a URL publica HTTPS da API.
- `ALLOWED_ORIGINS` na API deve incluir a URL publica HTTPS da Web.
- `APP_URL` deve apontar para a URL publica HTTPS da Web.
- `COOKIE_SECURE=true`.
- `COOKIE_SAMESITE=None` quando Web e API forem cross-site.
- `COOKIE_DOMAIN` deve ficar vazio se os servicos estiverem em dominios totalmente diferentes.
- `COOKIE_DOMAIN` so deve ser usado quando Web/API compartilharem um dominio controlado, por exemplo subdominios do mesmo dominio.
- `TRUST_PROXY=true` em hosts que terminam TLS/proxy antes do Node.

Nao inventar secrets. O operador deve gerar e inserir os valores reais na plataforma escolhida.
