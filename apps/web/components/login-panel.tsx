"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { loginWithPersona, type WebAuthPersona } from "../lib/auth-api";
import { getWorkspaceHomeRoute } from "../lib/route-access";
import { useAuthSession } from "./auth-session";

const personaActions: Array<{
  persona: WebAuthPersona;
  title: string;
  subtitle: string;
  route: string;
}> = [
  {
    persona: "buyer",
    title: "Buyer operations",
    subtitle: "Feed, auction detail, bidding, and pick-up queue",
    route: getWorkspaceHomeRoute("buyer")
  },
  {
    persona: "seller",
    title: "Seller operations",
    subtitle: "Lots, auction results, and pick-up status",
    route: getWorkspaceHomeRoute("seller")
  },
  {
    persona: "admin",
    title: "Admin operations",
    subtitle: "Buyer approvals and dispute resolution",
    route: getWorkspaceHomeRoute("admin")
  }
];

export function LoginPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, sessionExpired, signIn } = useAuthSession();
  const [persona, setPersona] = useState<WebAuthPersona>("buyer");
  const [email, setEmail] = useState("buyer.admin@bioloop.dev");
  const [password, setPassword] = useState("demo-password");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const signedInHomeRoute = session ? getWorkspaceHomeRoute(session.role) : null;
  const nextRoute = searchParams.get("next");
  const loginReason = searchParams.get("reason");

  const activeAction = useMemo(
    () => personaActions.find((item) => item.persona === persona) ?? personaActions[0],
    [persona]
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    const destination = signedInHomeRoute ?? "/";
    router.replace(destination);
    router.refresh();

    const fallbackTimer = window.setTimeout(() => {
      if (window.location.pathname === pathname) {
        window.location.assign(destination);
      }
    }, 150);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [pathname, router, session, signedInHomeRoute]);

  useEffect(() => {
    if (message) {
      return;
    }

    if (loginReason === "session-expired" || sessionExpired) {
      setMessage("Your session expired. Sign in again to continue.");
    }
  }, [loginReason, message, sessionExpired]);

  return (
    <main className="app-shell login-shell">
      <section className="login-grid">
        <div className="login-copy">
          <p className="eyebrow">Access control</p>
          <h1>Sign in to the operational area that matches your role.</h1>
          <p className="lead">
            The browser keeps only httpOnly cookies. This page requests a CSRF token first, posts your role-specific
            credentials to the API, and returns you to the correct operational route.
          </p>
          <div className="login-bridge">
            <span className="status-badge status-live">Buyer-first demo flow</span>
            <p className="muted">
              Use buyer as the default handoff, then move through seller and admin only after the API-backed flow is
              clear.
            </p>
          </div>

          <div className="persona-stack">
            {personaActions.map((action) => (
              <button
                key={action.persona}
                type="button"
                className={`persona-card ${persona === action.persona ? "persona-card-active" : ""}`}
                onClick={() => {
                  setPersona(action.persona);
                  setEmail(
                    action.persona === "buyer"
                      ? "buyer.admin@bioloop.dev"
                      : action.persona === "seller"
                        ? "seller.admin@bioloop.dev"
                        : "platform.admin@bioloop.dev"
                  );
                  setMessage("");
                }}
              >
                <span className="persona-card-title">{action.title}</span>
                <span className="persona-card-subtitle">{action.subtitle}</span>
              </button>
            ))}
          </div>

          <div className="login-notes">
            <span className="chip chip-accent">CSRF protected</span>
            <span className="chip">httpOnly cookies</span>
            <span className="chip">credentials include</span>
          </div>
        </div>

        <form
          className="panel login-panel"
          onSubmit={(event) => {
            event.preventDefault();

            startTransition(() => {
              void loginWithPersona({ email, password, persona })
                .then((nextSession) => {
                  signIn(nextSession);
                  setMessage(`Signed in as ${nextSession.roleLabel}. Redirecting...`);
                  router.replace(nextRoute || getWorkspaceHomeRoute(nextSession.role));
                  router.refresh();
                })
                .catch((error: unknown) => {
                  setMessage(error instanceof Error ? error.message : "Unable to sign in.");
                });
            });
          }}
        >
          <div className="panel-head">
            <div>
              <p className="eyebrow">Login</p>
              <h2>{activeAction.title}</h2>
            </div>
            <span className={`status-badge status-${persona === "buyer" ? "live" : "scheduled"}`}>{persona}</span>
          </div>
          <div className="login-route-note">
            <span className="label">Next route</span>
            <strong>{nextRoute || activeAction.route}</strong>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="buyer.admin@bioloop.dev"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="demo-password"
            />
          </label>

          <div className="login-actions">
            <button className="button button-primary" type="submit" disabled={isPending}>
              {isPending ? "Signing in..." : `Sign in as ${persona}`}
            </button>
            <Link className="button button-secondary" href={activeAction.route}>
              Open {activeAction.persona} area
            </Link>
          </div>

          <p className={`message ${message ? "message-visible" : ""}`} aria-live="polite">
            {message ||
              (session
                ? `You are already signed in as ${session.roleLabel}.`
                : "Use one of the seeded persona emails with the shared seeded password to establish the API-backed session.")}
          </p>
        </form>
      </section>
    </main>
  );
}
