"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutFromApi } from "../lib/auth-api";
import { useAuthSession } from "./auth-session";

export function AppHeader() {
  const router = useRouter();
  const { session, hydrated, signOut } = useAuthSession();
  const [isPending, startTransition] = useTransition();

  const signedInLabel = session
    ? `${session.roleLabel} · ${session.email}`
    : hydrated
      ? "Demo mode"
      : "Loading session...";

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <div>
          <p className="eyebrow">Bio Loop</p>
          <strong>Consolidation cockpit</strong>
        </div>
        <span className={`chip ${session ? "chip-accent" : ""}`}>{signedInLabel}</span>
      </div>

      <nav className="app-header-nav" aria-label="Primary">
        <Link href="/">Home</Link>
        <Link href="/login">Login</Link>
        <Link href="/buyer/feed">Buyer</Link>
        <Link href="/seller">Seller</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/seller/reports">Reports</Link>
        <Link href="/buyer/orders">Pickup</Link>
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
                    signOut();
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
