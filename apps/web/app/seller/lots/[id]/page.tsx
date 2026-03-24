import { SellerDashboard } from "../../../../components/seller-dashboard";

type SellerLotPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: SellerLotPageProps) {
  const { id } = await params;
  return {
    title: `Seller lot ${id}`,
    description: "Detailed seller lot view with status timeline"
  };
}

export default async function SellerLotPage({ params }: SellerLotPageProps) {
  const { id } = await params;
  return <SellerDashboard mode="lots" lotId={id} />;
}
