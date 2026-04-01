# Stack segura (Mar/2026) — MVP em produção (B2B Surplus Exchange)

## Objetivo

Padronizar versões e configurações **seguras** para:

- Node LTS + TS estável (baixo risco)
- NestJS + Express (default)
- Postgres 17.x
- Auth via **cookies httpOnly**
- CORS em allowlist
- CSRF para rotas state-changing (porque cookie)
- Docs OpenAPI + Scalar

---

## 1) Versões recomendadas (SAFE)

### Runtime / linguagem

- **Node.js:** 24.x (LTS)
- **TypeScript:** **~5.9.3** (linha estável, menor risco)

### Backend

- **NestJS:** ~11.1.x
- **Adapter HTTP:** Express (default do Nest)
- **PostgreSQL:** 17.x (use a minor mais recente do seu provedor)
- **Redis:** 7.x (se for gerenciado, use a última minor estável disponível)

### ORM / Validation / Docs

- **Prisma:** 7 Adapater Pg
- **Zod:** latest estável do momento no seu lockfile
- **OpenAPI (Swagger Nest):** @nestjs/swagger (compatível com Nest 11)
- **Scalar:** @scalar/api-reference (UI para OpenAPI)

### Frontend

- **Next.js:** 15.x (conservador e muito sólido em produção)
- **TanStack Query:** para cache + polling (leilão)
- **Tailwind + shadcn/ui:** para velocidade

> Política: travar majors, permitir minors/patch via `~` (backend) e lockfile com pnpm.

---

## 2) Arquivos para travar versões (copiar/colar)

### 2.1 .nvmrc (raiz)

`/ .nvmrc`

```txt
24
```

3. Auth segura com cookies httpOnly (padrão recomendado)
   3.1 Estratégia (resumo)
   Cookies httpOnly para access_token (curto) + refresh_token (mais longo)
   Secure=true em produção (HTTPS)
   SameSite=Lax (default seguro) ou SameSite=None se web e api estiverem em domínios diferentes (ex.: app._ e api._) — nesse caso exige HTTPS.
   Rotas state-changing (POST/PUT/PATCH/DELETE) protegidas com CSRF.
   3.2 Cookies (recomendação)

Access cookie

Name: access_token
TTL: 10–15 min

Refresh cookie

Name: refresh_token
TTL: 7–30 dias
Rotacionar refresh (invalidate antigo) para reduzir replay
3.3 Env vars (API)

/apps/api/.env.example

NODE_ENV=development
PORT=4000

APP_URL=http://localhost:3000
API_URL=http://localhost:4000

COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAMESITE=Lax

JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=14

TRUST_PROXY=false

DATABASE_URL=postgresql://user:pass@localhost:5432/surplus
REDIS_URL=redis://localhost:6379 4) CORS (allowlist) + cookies
4.1 Regra de ouro
Se credentials: true => não usar origin '\*'
Use allowlist explícita.
4.2 Nest main.ts (CORS + segurança + cookie parser)

/apps/api/src/main.ts (trecho)

import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
const app = await NestFactory.create(AppModule);

// Se estiver atrás de proxy (Vercel/NGINX/Cloudflare), habilite trust proxy em prod
// app.set("trust proxy", 1);

app.use(helmet());
app.use(cookieParser());

const allowedOrigins = [
"http://localhost:3000",
"https://app.seudominio.com",
"https://admin.seudominio.com"
];

app.enableCors({
origin: (origin, cb) => {
// Permite requests sem origin (ex.: curl, health checks)
if (!origin) return cb(null, true);
if (allowedOrigins.includes(origin)) return cb(null, true);
return cb(new Error("CORS blocked"), false);
},
credentials: true,
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"]
});

await app.listen(process.env.PORT || 4000);
}

bootstrap(); 5) CSRF (obrigatório quando auth é por cookie)
5.1 Opção simples (Express csurf) no Nest (MVP)
Habilitar csurf para rotas state-changing
Expor endpoint para o frontend buscar token e enviar em X-CSRF-Token

Importante: CSRF depende de cookies, então:

Frontend deve chamar com credentials: "include"
Enviar X-CSRF-Token nas mutações
5.2 Setup (conceito)
GET /auth/csrf retorna { csrfToken }
Em cada POST/PUT/PATCH/DELETE: header X-CSRF-Token: <token>

Implementação pode variar conforme sua arquitetura (pode ser middleware global + exclusões).

6. Swagger/OpenAPI + Scalar
   6.1 Swagger (Nest)
   Expor GET /openapi.json
   6.2 Scalar
   Servir em GET /reference apontando para /openapi.json

Exemplo de ideia (server-side):

/openapi.json via SwaggerModule
/reference retorna HTML do Scalar (ou você serve no Next) 7) Frontend com cookies (Next.js)
7.1 Fetch/React Query (padrão)

Sempre que chamar API:

credentials: "include"

Exemplo:

await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buyer/lots`, {
credentials: "include"
});
7.2 CSRF no client
Buscar /auth/csrf ao iniciar sessão (ou antes de mutações)
Guardar token em memória (não precisa localStorage)
Enviar em X-CSRF-Token 8) Checklist de produção (mínimo)
HTTPS em produção (obrigatório se SameSite=None)
Cookies: httpOnly + Secure + SameSite adequado
CORS allowlist + credentials
CSRF para mutações
Rate-limit em login/refresh (opcional no MVP, recomendado)
Logs estruturados + audit log para ações críticas
Migrações Prisma no deploy
Backup do Postgres + retenção 9) Recomendação final (SAFE MVP)

Stack final (safe):

Node 24 LTS
TypeScript ~5.9.3
NestJS 11.1.x (Express)
Postgres 17.x
Redis + BullMQ
Prisma + Zod
Next 15.x + TanStack Query
Swagger/OpenAPI + Scalar
Auth: cookies httpOnly + CSRF + CORS allowlist