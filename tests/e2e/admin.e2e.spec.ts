import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("admin can approve a buyer through the live workspace", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/admin/buyers");
  await page.getByLabel("Reviewer ID").fill("user_platform_admin");

  const freshMartCard = page.locator("article").filter({ hasText: "FreshMart Logistics" });
  await expect(freshMartCard).toContainText("Pending");

  await freshMartCard.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText("Buyer FreshMart Logistics updated in the admin workspace.")).toBeVisible();
  await expect(freshMartCard).toContainText("Approved");
});

test("admin can resolve an open dispute through the live workspace", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/admin/disputes");
  await page.getByLabel("Reviewer ID").fill("user_platform_admin");

  const disputeCard = page.locator("article").filter({ hasText: "No Show" });
  await expect(disputeCard).toContainText("Open");

  await disputeCard.getByRole("button", { name: "Settle" }).click();

  await expect(page.getByText(/updated in the admin workspace/)).toBeVisible();
  await expect(disputeCard).toContainText("Resolved");
});
