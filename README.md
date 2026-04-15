# Bio Loop Orchestrator

A production-style B2B marketplace showcase that helps supermarkets monetize surplus inventory through real-time, commodity-style trading.

![Bio Loop screenshot](docs/assets/bio-loop-showcase.png)

## Live Links

- Web: https://bio-loop-orchestrator-web.vercel.app
- API: https://bio-loop-orchestrator-production.up.railway.app
- API Health: https://bio-loop-orchestrator-production.up.railway.app/health
- API Readiness: https://bio-loop-orchestrator-production.up.railway.app/readiness
- OpenAPI: https://bio-loop-orchestrator-production.up.railway.app/openapi.json
- API Reference: https://bio-loop-orchestrator-production.up.railway.app/reference

## Why this project stands out

This repository demonstrates a senior-style delivery workflow, not just a UI prototype.

It includes:

- monorepo architecture with `pnpm` + `turbo`
- separate web and API runtimes
- Next.js 15 frontend
- NestJS API
- Prisma + PostgreSQL
- Redis-backed runtime support
- production deployment on Vercel + Railway
- documented deploy baseline, readiness review, and evidence pack
- validated public runtime with health, readiness, OpenAPI, and API reference endpoints

## Architecture

```text
apps/web   -> Next.js 15 frontend deployed on Vercel
apps/api   -> NestJS API deployed on Railway
Postgres   -> Railway PostgreSQL
Redis      -> Railway Redis

Key Features
guided buyer, seller, and admin showcase flow
cookie-based auth flow
API-backed buyer feed
admin and seller operational paths
public API documentation
deployment and operational documentation inside the repo
Tech Stack
Next.js 15
React
NestJS
Prisma
PostgreSQL
Redis
pnpm workspaces
Turborepo
Vercel
Railway
Project Structure

apps/
  web/        Next.js app
  api/        NestJS API

packages/
  domain/     domain contracts
  shared/     shared utilities

docs/
  deploy/     deployment docs
  ops/        operational evidence and readiness docs
Deployment Status

Validated public deployment baseline:

Web deployed and accessible
API deployed and accessible
/health validated
/readiness validated
/openapi.json validated
/reference validated
Local Development
Prerequisites
Node 24.x
pnpm
Docker Desktop, if using local Postgres/Redis containers
Install
pnpm install
Run web
pnpm --filter @bio-loop/web dev
Run API
pnpm --filter @bio-loop/api dev
Environment

Example environment variables are documented in:

.env.example

Production values are not committed.

Documentation
Railway API deployment notes
Pilot evidence pack
Assisted demo script
Pilot readiness review
Notes

This repository is presented as a validated showcase baseline. Some operational flows may still depend on seeded/demo data or assisted walkthrough context.

Author

Ricardo Souza
