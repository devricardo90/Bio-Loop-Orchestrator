import type { ReactNode } from "react";
import { WorkspaceRouteGate } from "../../components/route-guard";

export default function BuyerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <WorkspaceRouteGate workspace="buyer">{children}</WorkspaceRouteGate>;
}
