import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("admin can approve a buyer through the live API", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/admin/buyers");
  await page.getByLabel("Reviewer ID").fill("user_platform_admin");

  const freshMartCard = page.locator("article").filter({ hasText: "FreshMart Logistics" });
  await expect(freshMartCard).toContainText("PENDING");

  await freshMartCard.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText("Buyer FreshMart Logistics updated through the admin API.")).toBeVisible();
  await expect(freshMartCard).toContainText("APPROVED");
});

test("admin can resolve an open dispute through the live API", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/admin/disputes");
  await page.getByLabel("Reviewer ID").fill("user_platform_admin");

  const disputeCard = page.locator("article").filter({ hasText: "NO_SHOW" });
  await expect(disputeCard).toContainText("OPEN");

  await disputeCard.getByRole("button", { name: "Settle" }).click();

  await expect(page.getByText(/updated through the admin API/)).toBeVisible();
  await expect(disputeCard).toContainText("RESOLVED");
});
