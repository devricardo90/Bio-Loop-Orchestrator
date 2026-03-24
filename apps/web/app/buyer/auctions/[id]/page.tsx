import { BuyerDashboard } from "../../../../components/buyer-dashboard";

type BuyerAuctionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: BuyerAuctionPageProps) {
  const { id } = await params;
  return {
    title: `Auction ${id}`,
    description: "Auction detail with bid panel"
  };
}

export default async function BuyerAuctionPage({ params }: BuyerAuctionPageProps) {
  const { id } = await params;
  return <BuyerDashboard mode="auction" auctionId={id} />;
}
