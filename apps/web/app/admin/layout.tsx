import type { ReactNode } from "react";
import { WorkspaceRouteGate } from "../../components/route-guard";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <WorkspaceRouteGate workspace="admin">{children}</WorkspaceRouteGate>;
}
