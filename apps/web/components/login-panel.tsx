"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { formatAuthRoleLabel, loginWithPersona, type WebAuthPersona } from "../lib/auth-api";
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

const getPersonaColor = (p: WebAuthPersona): string =>
  p === "buyer" ? "var(--accent)" : p === "seller" ? "var(--gold)" : "var(--muted)";

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
      <div className="login-center">
        {/* Card header */}
        <div className="login-card-header">
          <p className="eyebrow">Bio Loop</p>
          <h2>Sign in</h2>
          <p className="login-card-sub">Select workspace and enter credentials</p>
        </div>

        {/* Role segmented control */}
        <div className="role-tabs">
          {personaActions.map((action) => (
            <button
              key={action.persona}
              type="button"
              className={`role-tab ${persona === action.persona ? "role-tab-active" : ""}`}
              style={persona === action.persona ? { color: getPersonaColor(action.persona) } : undefined}
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
              {action.persona}
            </button>
          ))}
        </div>

        {/* Login form card */}
        <form
          className="login-form-card"
          onSubmit={(event) => {
            event.preventDefault();

            startTransition(() => {
              void loginWithPersona({ email, password, persona })
                .then((nextSession) => {
                  signIn(nextSession);
                  setMessage(`Signed in to ${formatAuthRoleLabel(nextSession.roleLabel)}. Redirecting...`);
                  router.replace(nextRoute || getWorkspaceHomeRoute(nextSession.role));
                  router.refresh();
                })
                .catch((error: unknown) => {
                  setMessage(error instanceof Error ? error.message : "Unable to sign in.");
                });
            });
          }}
        >
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

          <button
            className="button button-primary"
            type="submit"
            disabled={isPending}
            style={{ width: "100%" }}
          >
            {isPending ? "Signing in..." : `Sign in as ${persona}`}
          </button>

          <p
            className={`message ${message ? "message-visible" : ""}`}
            aria-live="polite"
          >
            {message ||
              (session
                ? `You are already signed in to ${formatAuthRoleLabel(session.roleLabel)}.`
                : "Use the seeded demo credentials to start a live product session.")}
          </p>
        </form>

        {/* Skip link */}
        <div className="login-footer-links">
          <Link className="button button-secondary" href={activeAction.route}>
            Skip - open {activeAction.persona} workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
