"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { WebSession } from "../lib/auth-api";

const AUTH_SESSION_KEY = "bio-loop-web-auth-session";

type AuthSessionContextValue = {
  session: WebSession | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  signIn: (session: WebSession) => void;
  signOut: () => void;
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

  useEffect(() => {
    setSession(loadSession());
    setHydrated(true);
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

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      hydrated,
      isAuthenticated: Boolean(session),
      signIn: (nextSession) => setSession(nextSession),
      signOut: () => setSession(null)
    }),
    [hydrated, session]
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
