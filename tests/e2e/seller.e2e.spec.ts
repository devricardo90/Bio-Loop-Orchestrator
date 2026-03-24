import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("seller can load reports and export the billing snapshot", async ({ page }) => {
  await loginAs(page, "seller");

  await page.goto("/seller/reports");

  await expect(page.getByRole("heading", { name: "Invoices, fees, and export for settled orders." })).toBeVisible();
  await expect(page.getByText("Aggregate billing snapshot")).toBeVisible();

  await page.getByRole("button", { name: "Export reports" }).click();

  await expect(page.getByText(/Export ready:/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Download export" })).toBeVisible();
});
