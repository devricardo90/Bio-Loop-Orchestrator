export type WorkspaceRole = "buyer" | "seller" | "admin";

export type WorkspaceLink = {
  label: string;
  href: string;
};

export type WorkspaceAccessDecision =
  | {
      kind: "loading";
    }
  | {
      kind: "allow";
    }
  | {
      kind: "redirect";
      href: string;
      reason: "unauthenticated" | "forbidden";
    };

const workspaceHomeRoute: Record<WorkspaceRole, string> = {
  buyer: "/buyer/feed",
  seller: "/seller",
  admin: "/admin"
};

const workspaceLabels: Record<WorkspaceRole, string> = {
  buyer: "buyer operations",
  seller: "seller operations",
  admin: "admin operations"
};

const workspaceNavigation: Record<WorkspaceRole, WorkspaceLink[]> = {
  buyer: [
    { label: "Buyer feed", href: "/buyer/feed" },
    { label: "Pickup queue", href: "/buyer/orders" }
  ],
  seller: [
    { label: "Seller overview", href: "/seller" },
    { label: "Seller lots", href: "/seller/lots" },
    { label: "Seller results", href: "/seller/results" },
    { label: "Seller reports", href: "/seller/reports" }
  ],
  admin: [
    { label: "Admin overview", href: "/admin" },
    { label: "Admin buyers", href: "/admin/buyers" },
    { label: "Admin disputes", href: "/admin/disputes" }
  ]
};

export function getWorkspaceHomeRoute(role: WorkspaceRole) {
  return workspaceHomeRoute[role];
}

export function getWorkspaceLabel(role: WorkspaceRole) {
  return workspaceLabels[role];
}

export function getWorkspaceNavigation(role?: WorkspaceRole | null) {
  if (!role) {
    return [
      { label: "Home", href: "/" },
      { label: "Login", href: "/login" }
    ] satisfies WorkspaceLink[];
  }

  return workspaceNavigation[role];
}

export function getWorkspaceAccessDecision(input: {
  hydrated: boolean;
  pathname: string;
  workspace: WorkspaceRole;
  sessionRole: WorkspaceRole | null;
}): WorkspaceAccessDecision {
  if (!input.hydrated) {
    return { kind: "loading" };
  }

  if (!input.sessionRole) {
    return {
      kind: "redirect",
      href: buildLoginHref(input.pathname),
      reason: "unauthenticated"
    };
  }

  if (input.sessionRole !== input.workspace) {
    return {
      kind: "redirect",
      href: getWorkspaceHomeRoute(input.sessionRole),
      reason: "forbidden"
    };
  }

  return { kind: "allow" };
}

function buildLoginHref(pathname: string) {
  const next = encodeURIComponent(pathname || "/");
  return `/login?next=${next}`;
}
