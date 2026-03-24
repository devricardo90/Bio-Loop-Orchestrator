"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "./auth-session";
import { getWorkspaceAccessDecision, getWorkspaceLabel, type WorkspaceRole } from "../lib/route-access";

type WorkspaceRouteGateProps = Readonly<{
  workspace: WorkspaceRole;
  children: ReactNode;
}>;

export function WorkspaceRouteGate({ workspace, children }: WorkspaceRouteGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, hydrated, sessionExpired } = useAuthSession();
  const decision = getWorkspaceAccessDecision({
    hydrated,
    pathname,
    workspace,
    sessionRole: session?.role ?? null
  });
  const redirectHref =
    decision.kind === "redirect"
      ? decision.reason === "unauthenticated" && sessionExpired
        ? `/login?reason=session-expired&next=${encodeURIComponent(pathname)}`
        : decision.href
      : null;

  useEffect(() => {
    if (!redirectHref) {
      return;
    }

    router.replace(redirectHref);
    router.refresh();
  }, [redirectHref, router]);

  if (decision.kind === "loading") {
    return <main className="app-shell">Loading {getWorkspaceLabel(workspace)}...</main>;
  }

  if (decision.kind === "redirect") {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="eyebrow">Route guard</p>
          <h1>
            {decision.reason === "unauthenticated"
              ? `Sign in to open the ${getWorkspaceLabel(workspace)}.`
              : `Opening the ${getWorkspaceLabel(session?.role ?? workspace)}.`}
          </h1>
          <p className="muted">
            {decision.reason === "unauthenticated"
              ? sessionExpired
                ? "Your previous session expired or could not be refreshed. Sign in again to continue."
                : "The current route is protected and requires an authenticated session."
              : "Your signed-in role does not match this workspace, so the router is sending you to the correct area."}
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
