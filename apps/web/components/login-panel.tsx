"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { loginWithPersona, type WebAuthPersona } from "../lib/auth-api";
import { useAuthSession } from "./auth-session";

const personaActions: Array<{
  persona: WebAuthPersona;
  title: string;
  subtitle: string;
  route: string;
}> = [
  {
    persona: "buyer",
    title: "Buyer workspace",
    subtitle: "Feed, auction detail, bidding, and pickup queue",
    route: "/buyer/feed"
  },
  {
    persona: "seller",
    title: "Seller workspace",
    subtitle: "Lots, auction results, and pickup status",
    route: "/seller"
  },
  {
    persona: "admin",
    title: "Admin workspace",
    subtitle: "Buyer approvals and dispute resolution",
    route: "/admin"
  }
];

export function LoginPanel() {
  const router = useRouter();
  const { session, signIn } = useAuthSession();
  const [persona, setPersona] = useState<WebAuthPersona>("buyer");
  const [email, setEmail] = useState("buyer.admin@bioloop.dev");
  const [password, setPassword] = useState("demo-password");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeAction = useMemo(
    () => personaActions.find((item) => item.persona === persona) ?? personaActions[0],
    [persona]
  );

  return (
    <main className="app-shell login-shell">
      <section className="login-grid">
        <div className="login-copy">
          <p className="eyebrow">Auth handoff</p>
          <h1>Sign in to the workspace that fits your role.</h1>
          <p className="lead">
            The browser only keeps httpOnly cookies. The login page pulls a CSRF token first, then posts your persona
            to the API and sends you to the right workspace.
          </p>

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
                  router.push(activeAction.route);
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
              Continue to {activeAction.persona}
            </Link>
          </div>

          <p className={`message ${message ? "message-visible" : ""}`} aria-live="polite">
            {message ||
              (session
                ? `You are already signed in as ${session.roleLabel}.`
                : "Use any non-empty email/password pair; the API is wired for auth flow, not credential validation yet.")}
          </p>
        </form>
      </section>
    </main>
  );
}
