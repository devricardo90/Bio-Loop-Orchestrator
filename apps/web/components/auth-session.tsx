"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthApiError, isSessionExpired, refreshAuthSession, type WebSession } from "../lib/auth-api";

const AUTH_SESSION_KEY = "bio-loop-web-auth-session";
const REFRESH_LEAD_TIME_MS = 60_000;

type AuthStatus = "loading" | "authenticated" | "anonymous" | "expired";

type AuthSessionContextValue = {
  session: WebSession | null;
  hydrated: boolean;
  status: AuthStatus;
  sessionExpired: boolean;
  isAuthenticated: boolean;
  signIn: (session: WebSession) => void;
  signOut: (reason?: "manual" | "expired") => void;
  refreshSession: () => Promise<boolean>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function loadSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WebSession;
  } catch {
    return null;
  }
}

export function AuthSessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [session, setSession] = useState<WebSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const refreshTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const storedSession = loadSession();

    if (!storedSession) {
      setSession(null);
      setStatus("anonymous");
      setHydrated(true);
      return;
    }

    if (isSessionExpired(storedSession)) {
      setSession(null);
      setStatus("expired");
      setHydrated(true);
      return;
    }

    void refreshAuthSession(storedSession)
      .then((nextSession) => {
        setSession(nextSession);
        setStatus("authenticated");
      })
      .catch((error: unknown) => {
        if (error instanceof AuthApiError && error.reason === "network" && !isSessionExpired(storedSession)) {
          setSession(storedSession);
          setStatus("authenticated");
          return;
        }

        setSession(null);
        setStatus("expired");
      })
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    if (session) {
      window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      return;
    }

    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  }, [hydrated, session]);

  useEffect(() => {
    if (refreshTimeoutRef.current !== null) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    if (!hydrated || !session) {
      return;
    }

    const expiresAt = Date.parse(session.accessTokenExpiresAt);
    if (Number.isNaN(expiresAt)) {
      setSession(null);
      setStatus("expired");
      return;
    }

    const timeoutMs = Math.max(expiresAt - Date.now() - REFRESH_LEAD_TIME_MS, 0);
    refreshTimeoutRef.current = window.setTimeout(() => {
      void refreshAuthSession(session)
        .then((nextSession) => {
          setSession(nextSession);
          setStatus("authenticated");
        })
        .catch((error: unknown) => {
          if (error instanceof AuthApiError && error.reason === "network" && !isSessionExpired(session)) {
            return;
          }

          setSession(null);
          setStatus("expired");
        });
    }, timeoutMs);
  }, [hydrated, session]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      hydrated,
      status,
      sessionExpired: status === "expired",
      isAuthenticated: Boolean(session),
      signIn: (nextSession) => {
        setSession(nextSession);
        setStatus("authenticated");
      },
      signOut: (reason = "manual") => {
        setSession(null);
        setStatus(reason === "expired" ? "expired" : "anonymous");
      },
      refreshSession: async () => {
        if (!session) {
          setStatus("anonymous");
          return false;
        }

        try {
          const nextSession = await refreshAuthSession(session);
          setSession(nextSession);
          setStatus("authenticated");
          return true;
        } catch (error: unknown) {
          if (error instanceof AuthApiError && error.reason === "network" && !isSessionExpired(session)) {
            return true;
          }

          setSession(null);
          setStatus("expired");
          return false;
        }
      }
    }),
    [hydrated, session, status]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return value;
}
