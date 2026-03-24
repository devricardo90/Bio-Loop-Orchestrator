import { SellerDashboard } from "../../../components/seller-dashboard";

export const metadata = {
  title: "Seller lots",
  description: "Lot list with status timeline and auction outcomes"
};

export default function SellerLotsPage() {
  return <SellerDashboard mode="lots" />;
}
