import { BuyerDashboard } from "../../../components/buyer-dashboard";

export const metadata = {
  title: "Buyer feed",
  description: "Live buyer feed with polling and auction detail links"
};

export default function BuyerFeedPage() {
  return <BuyerDashboard mode="feed" />;
}
