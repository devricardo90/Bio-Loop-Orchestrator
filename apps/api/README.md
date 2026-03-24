# API

## Documentation

- `GET /openapi.json`
- `GET /reference`

## Auth bootstrap

This API uses cookie-based auth for the MVP foundation:

- `GET /auth/csrf` issues the CSRF cookie/token pair.
- `POST /auth/login` creates httpOnly access and refresh cookies.
- `POST /auth/refresh` rotates the refresh token.
- `POST /auth/logout` clears the session cookies.

## Local env

Copy `.env.example` to `.env` and adjust the origin/cookie settings for your local setup.

## Verification

```bash
pnpm --filter @bio-loop/api typecheck
pnpm --filter @bio-loop/api test
pnpm --filter @bio-loop/api build
```
