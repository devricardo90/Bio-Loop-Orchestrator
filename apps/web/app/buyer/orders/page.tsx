import { PickupDashboard } from "../../../components/pickup-dashboard";

export const metadata = {
  title: "Pickup queue",
  description: "Buyer pickup scheduling and POD workspace"
};

export default function BuyerOrdersPage() {
  return <PickupDashboard mode="list" />;
}
