import { expect, test } from "@playwright/test";
import { fetchBuyerFeedSnapshot, loginAs } from "./helpers";

test("buyer feed, auction detail, and pickup stay anchored to API-backed data", async ({ page }) => {
  await loginAs(page, "buyer");

  const feed = await fetchBuyerFeedSnapshot(page);
  const liveAuction = feed.auctions.find((auction) => auction.auction.status === "LIVE") ?? feed.auctions[0];
  const pickupOrderRecord = feed.auctions.find((auction) => auction.order) ?? null;

  expect(feed.source).toBe("api");
  expect(feed.auctions.length).toBeGreaterThan(0);
  if (!liveAuction) {
    throw new Error("Expected at least one API-backed buyer auction.");
  }

  if (!pickupOrderRecord || !pickupOrderRecord.order) {
    throw new Error("Expected at least one API-backed buyer order for pickup coverage.");
  }

  await page.goto("/buyer/feed");

  await expect(page.getByRole("heading", { name: "A feed built for industrial buyers." })).toBeVisible();
  await expect(page.getByText("source=api")).toBeVisible();
  await expect(page.locator("article").filter({ hasText: liveAuction.storeName })).toContainText(liveAuction.categoryName);

  await page.locator("article").filter({ hasText: liveAuction.storeName }).getByRole("link", { name: "Open auction" }).click();

  await expect(page.getByRole("heading", { name: "Auction view with contract-safe bidding." })).toBeVisible();
  await expect(page.getByRole("heading", { name: liveAuction.categoryName })).toBeVisible();
  await expect(page.getByText(liveAuction.storeName)).toBeVisible();
  await expect(page.getByText("source=api")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open /reference" })).toBeVisible();

  await page.goto("/buyer/orders");

  await expect(page.getByRole("heading", { name: "Schedule pickups and keep PODs moving." })).toBeVisible();
  await expect(page.getByText("source=api")).toBeVisible();
  await expect(page.locator("article").filter({ hasText: pickupOrderRecord.storeName })).toContainText(
    pickupOrderRecord.order.pickupStatus
  );

  await Promise.all([
    page.waitForURL(new RegExp(`/buyer/orders/${pickupOrderRecord.order.id}$`)),
    page.locator("article").filter({ hasText: pickupOrderRecord.storeName }).getByRole("link", { name: "Open pickup detail" }).click()
  ]);

  await expect(page.getByRole("heading", { name: "Pickup detail with proof upload and dispute state." })).toBeVisible();
  await expect(page.locator(".detail-sidebar").getByText(pickupOrderRecord.order.id, { exact: true })).toBeVisible();
  await expect(page.locator(".detail-sidebar").getByText(pickupOrderRecord.order.pickupStatus, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Schedule pickup" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit POD" })).toBeVisible();
});
