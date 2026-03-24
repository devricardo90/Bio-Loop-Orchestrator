import type { ReactNode } from "react";
import { WorkspaceRouteGate } from "../../components/route-guard";

export default function SellerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <WorkspaceRouteGate workspace="seller">{children}</WorkspaceRouteGate>;
}
