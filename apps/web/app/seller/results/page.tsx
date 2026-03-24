import { SellerDashboard } from "../../../components/seller-dashboard";

export const metadata = {
  title: "Seller results",
  description: "Auction outcomes and settlement state"
};

export default function SellerResultsPage() {
  return <SellerDashboard mode="results" />;
}
