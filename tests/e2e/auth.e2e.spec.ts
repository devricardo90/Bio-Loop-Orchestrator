import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("buyer can log in and open the live auction surface", async ({ page }) => {
  await loginAs(page, "buyer");

  await expect(page.getByRole("heading", { name: "A feed built for industrial buyers." })).toBeVisible();

  await page.goto("/buyer/auctions/auction-husks-01");

  await expect(page.getByRole("heading", { name: "Auction view with contract-safe bidding." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Place a live bid" })).toBeVisible();
  await expect(page.getByText("Approved buyer")).toBeVisible();
});

test("seller is redirected away from the admin workspace by the route guard", async ({ page }) => {
  await loginAs(page, "seller");

  await page.goto("/admin/buyers");

  await expect(page).toHaveURL(/\/seller$/);
  await expect(page.getByRole("heading", { name: "Operational control for lots and outcomes." })).toBeVisible();
});
