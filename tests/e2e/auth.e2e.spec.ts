import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("buyer can log in and open the live auction surface", async ({ page }) => {
  await loginAs(page, "buyer");

  await expect(page.getByRole("heading", { name: "A feed built for industrial buyers." })).toBeVisible();
  await expect(page.locator("span.chip").filter({ hasText: "source=api" })).toBeVisible();
  await expect(page.getByRole("link", { name: "API reference" })).toBeVisible();

  await page.goto("/buyer/auctions/auction-husks-01");

  await expect(page.getByRole("heading", { name: "Auction view with contract-safe bidding." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Place a live bid" })).toBeVisible();
  await expect(page.getByText("Approved buyer")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open /reference" })).toBeVisible();
});

test("seller is redirected away from the admin workspace by the route guard", async ({ page }) => {
  await loginAs(page, "seller");

  await page.goto("/admin/buyers");

  await expect(page).toHaveURL(/\/seller$/);
  await expect(page.getByRole("heading", { name: "Seller review for lots, outcomes, and reports." })).toBeVisible();
});

test("expired-session redirect preserves the sign-in handoff", async ({ page }) => {
  await page.goto("/login?reason=session-expired&next=%2Fbuyer%2Ffeed");

  await expect(page.getByText("Your session expired. Sign in again to continue.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in to the operational area that matches your role." })).toBeVisible();
});
