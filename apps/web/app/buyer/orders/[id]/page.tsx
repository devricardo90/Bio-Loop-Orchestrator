import { PickupDashboard } from "../../../../components/pickup-dashboard";

type BuyerOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: BuyerOrderPageProps) {
  const { id } = await params;
  return {
    title: `Pickup order ${id}`,
    description: "Pickup scheduling and POD detail view"
  };
}

export default async function BuyerOrderPage({ params }: BuyerOrderPageProps) {
  const { id } = await params;
  return <PickupDashboard mode="detail" orderId={id} />;
}
