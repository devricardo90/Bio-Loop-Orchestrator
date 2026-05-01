# DEPLOY-02A — Production Domain Preparation

## Objetivo
Documentar e travar os pré-requisitos externos (DNS e Domínios) necessários para a execução da tarefa `DEPLOY-02`. Este documento é uma **preparação**, não uma implementação. Nenhuma configuração real deve ser feita nesta fase.

---

## 1. Definição de Domínios

| Atributo | Valor Atual | Status |
| :--- | :--- | :--- |
| **Domínio Base** | `UNCONFIRMED` | Pending Trigger confirmation |
| **Subdomínio Web (Frontend)** | `pending` | Pending Trigger confirmation |
| **Subdomínio API (Backend)** | `pending` | Pending Trigger confirmation |

---

## 2. Mapeamento de Provedores

*   **Web (Frontend):** Vercel
*   **API (Backend):** Railway
*   **DNS Manager:** `UNCONFIRMED` (ex: Cloudflare, GoDaddy, AWS Route53)

---

## 3. Registros DNS Esperados (Placeholders)

> **IMPORTANTE:** Os valores de destino (Target/Value) **NÃO** devem ser inventados. Eles devem ser copiados obrigatoriamente dos dashboards oficiais da Vercel e Railway apenas durante a execução da tarefa `DEPLOY-02`.

| Tipo | Host | Valor/Alvo Esperado | Fonte da Verdade |
| :--- | :--- | :--- | :--- |
| `CNAME` | (Web Host) | `[Copy from Vercel Dashboard]` | Vercel Project Settings > Domains |
| `CNAME` | (API Host) | `[Copy from Railway Dashboard]` | Railway Service Settings > Networking |

---

## 4. Variáveis de Ambiente Alvo (Draft)

Estas variáveis serão aplicadas nos provedores durante a `DEPLOY-02`.

### Web (Vercel)
*   `NEXT_PUBLIC_API_URL`: `https://[api.confirmed.domain]`

### API (Railway)
*   `APP_URL`: `https://[app.confirmed.domain]`
*   `ALLOWED_ORIGINS`: `https://[app.confirmed.domain]`
*   `COOKIE_SECURE`: `true`
*   `COOKIE_SAMESITE`: `Lax`
*   `COOKIE_DOMAIN`: `""` (vazio/host-only)

---

## 5. Prontidão para SSL e Validação
*   O SSL deve ser emitido automaticamente pelos provedores (Let's Encrypt).
*   **Critério de Prontidão:** Resposta `200 OK` via HTTPS nos novos endereços antes de testar o login.

---

## 6. Riscos e Rollback
*   **Risco:** Inconsistência de TTL e cache de DNS impedindo o envio do cookie CSRF.
*   **Rollback:** Reverter as variáveis de ambiente para os domínios padrão (`vercel.app` / `up.railway.app`).

---

## Estado Atual do Trigger
**SITUAÇÃO:** `BLOCKED / WAITING`
**MOTIVO:** Aguardando confirmação do usuário sobre o Domínio Base e confirmação de acesso ao painel de DNS.
