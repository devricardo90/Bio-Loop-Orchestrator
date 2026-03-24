import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const feedPage = readFileSync(new URL("../app/buyer/feed/page.tsx", import.meta.url), "utf8");
const auctionPage = readFileSync(
  new URL("../app/buyer/auctions/[id]/page.tsx", import.meta.url),
  "utf8"
);
const sellerHome = readFileSync(new URL("../app/seller/page.tsx", import.meta.url), "utf8");
const sellerLotsPage = readFileSync(new URL("../app/seller/lots/page.tsx", import.meta.url), "utf8");
const sellerLotDetail = readFileSync(new URL("../app/seller/lots/[id]/page.tsx", import.meta.url), "utf8");
const sellerResultsPage = readFileSync(new URL("../app/seller/results/page.tsx", import.meta.url), "utf8");
const buyerOrdersPage = readFileSync(new URL("../app/buyer/orders/page.tsx", import.meta.url), "utf8");
const buyerOrderDetail = readFileSync(new URL("../app/buyer/orders/[id]/page.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../components/buyer-dashboard.tsx", import.meta.url), "utf8");
const bidPanel = readFileSync(new URL("../components/bid-panel.tsx", import.meta.url), "utf8");
const sellerDashboard = readFileSync(new URL("../components/seller-dashboard.tsx", import.meta.url), "utf8");
const pickupDashboard = readFileSync(new URL("../components/pickup-dashboard.tsx", import.meta.url), "utf8");
const sellerView = readFileSync(new URL("../lib/seller-view.ts", import.meta.url), "utf8");
const pickupView = readFileSync(new URL("../lib/pickup-view.ts", import.meta.url), "utf8");

assert.match(page, /buyer feed/i);
assert.match(layout, /AuctionStoreProvider/);
assert.match(feedPage, /BuyerDashboard/);
assert.match(auctionPage, /BuyerDashboard/);
assert.match(dashboard, /BidPanel/);
assert.match(bidPanel, /Bid panel/i);
assert.match(sellerHome, /seller hub/i);
assert.match(sellerLotsPage, /SellerDashboard/);
assert.match(sellerLotDetail, /SellerDashboard/);
assert.match(sellerResultsPage, /SellerDashboard/);
assert.match(sellerDashboard, /seller operations/i);
assert.match(sellerView, /getSellerTimeline/);
assert.match(buyerOrdersPage, /PickupDashboard/);
assert.match(buyerOrderDetail, /PickupDashboard/);
assert.match(pickupDashboard, /Schedule pickup/i);
assert.match(pickupDashboard, /Submit POD/i);
assert.match(pickupView, /getPickupTimeline/);
