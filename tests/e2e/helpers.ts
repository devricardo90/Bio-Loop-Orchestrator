import { expect, type Page } from "@playwright/test";

export async function loginAs(page: Page, persona: "buyer" | "seller" | "admin") {
  await page.goto("/login");
  await page.getByRole("button", { name: workspaceTitle(persona) }).click();
  await page.getByRole("button", { name: `Sign in as ${persona}` }).click();

  await expect(page).toHaveURL(workspacePath(persona));
}

function workspaceTitle(persona: "buyer" | "seller" | "admin") {
  if (persona === "buyer") {
    return "Buyer operations";
  }

  if (persona === "seller") {
    return "Seller operations";
  }

  return "Admin operations";
}

function workspacePath(persona: "buyer" | "seller" | "admin") {
  if (persona === "buyer") {
    return /\/buyer\/feed$/;
  }

  if (persona === "seller") {
    return /\/seller$/;
  }

  return /\/admin$/;
}
