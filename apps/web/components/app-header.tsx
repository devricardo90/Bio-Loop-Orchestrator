"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatAuthRoleLabel, logoutFromApi } from "../lib/auth-api";
import { getApiReferenceHref } from "../lib/api-reference";
import { getWorkspaceNavigation } from "../lib/route-access";
import { useAuthSession } from "./auth-session";

export function AppHeader() {
  const router = useRouter();
  const { session, hydrated, sessionExpired, signOut } = useAuthSession();
  const [isPending, startTransition] = useTransition();
  const navigation = getWorkspaceNavigation(session?.role ?? null);

  const sessionLabel = session
    ? `${formatAuthRoleLabel(session.roleLabel)} | ${session.email}`
    : sessionExpired
      ? "Session expired"
      : null;

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <div>
          <p className="eyebrow">Bio Loop</p>
          <strong>Operations console</strong>
        </div>
        {sessionLabel ? (
          <span className={`chip app-header-session-chip ${session ? "chip-accent" : ""}`}>{sessionLabel}</span>
        ) : null}
      </div>

      <nav className="app-header-nav" aria-label="Primary">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <a href={getApiReferenceHref()} target="_blank" rel="noreferrer">
          System docs
        </a>
      </nav>

      <div className="app-header-actions">
        {session ? (
          <button
            className="button button-secondary app-header-button"
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                void logoutFromApi()
                  .catch(() => null)
                  .finally(() => {
                    signOut("manual");
                    router.push("/login");
                    router.refresh();
                  });
              });
            }}
          >
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        ) : (
          <Link href="/login" className="button button-primary app-header-button">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
