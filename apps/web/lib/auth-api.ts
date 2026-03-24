const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export type WebAuthPersona = "buyer" | "seller" | "admin";
export type WebAuthRole = "BUYER_ADMIN" | "SELLER_ADMIN" | "PLATFORM_ADMIN";

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    role: WebAuthRole;
  };
  accessTokenExpiresAt: string;
};

export type WebSession = {
  userId: string;
  email: string;
  role: WebAuthPersona;
  roleLabel: WebAuthRole;
  authenticatedAt: string;
  accessTokenExpiresAt: string;
  source: "api";
};

function mapPersonaToRole(persona: WebAuthPersona): WebAuthRole {
  if (persona === "buyer") {
    return "BUYER_ADMIN";
  }

  if (persona === "seller") {
    return "SELLER_ADMIN";
  }

  return "PLATFORM_ADMIN";
}

function mapRoleToPersona(role: WebAuthRole): WebAuthPersona {
  if (role.startsWith("BUYER")) {
    return "buyer";
  }

  if (role.startsWith("SELLER")) {
    return "seller";
  }

  return "admin";
}

export async function fetchAuthCsrfToken() {
  const response = await fetch(`${apiBaseUrl}/auth/csrf`, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`CSRF request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { csrfToken?: unknown };
  if (typeof payload.csrfToken !== "string" || payload.csrfToken.length === 0) {
    throw new Error("CSRF token missing from auth response");
  }

  return payload.csrfToken;
}

export async function loginWithPersona(input: {
  email: string;
  password: string;
  persona: WebAuthPersona;
}): Promise<WebSession> {
  const csrfToken = await fetchAuthCsrfToken();
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      role: mapPersonaToRole(input.persona)
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Login request failed with ${response.status}`);
  }

  const payload = (await response.json()) as LoginResponse;
  return {
    userId: payload.user.id,
    email: payload.user.email,
    role: mapRoleToPersona(payload.user.role),
    roleLabel: payload.user.role,
    authenticatedAt: new Date().toISOString(),
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
    source: "api"
  };
}

export async function logoutFromApi() {
  const csrfToken = await fetchAuthCsrfToken();
  const response = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Logout request failed with ${response.status}`);
  }

  return true;
}
