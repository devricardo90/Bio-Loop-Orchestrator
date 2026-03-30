import { expect, type Page } from "@playwright/test";

export async function loginAs(page: Page, persona: "buyer" | "seller" | "admin") {
  await page.goto("/login");
  await page.getByRole("button", { name: workspaceTitle(persona) }).click();
  await expect(page.getByLabel("Email")).toHaveValue(workspaceEmail(persona));
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

function workspaceEmail(persona: "buyer" | "seller" | "admin") {
  if (persona === "buyer") {
    return "buyer.admin@bioloop.dev";
  }

  if (persona === "seller") {
    return "seller.admin@bioloop.dev";
  }

  return "platform.admin@bioloop.dev";
}

export type BuyerFeedSnapshot = {
  source: "api";
  buyers: Array<{
    id: string;
    name: string;
    approved: boolean;
    reputation: number;
    note: string;
  }>;
  activeBuyerId: string;
  auctions: Array<{
    id: string;
    storeName: string;
    categoryName: string;
    summary: string;
    tags: string[];
    lot: {
      id: string;
      pickupWindow: {
        startAt: string;
        endAt: string;
      };
    };
    auction: {
      id: string;
      status: string;
    };
    order?: {
      id: string;
      status: string;
      pickupStatus: string;
    };
  }>;
  lastSyncedAt: string;
};

export async function fetchBuyerFeedSnapshot(page: Page) {
  const response = await page.request.get("http://localhost:4101/buyer/auctions/feed");

  if (!response.ok()) {
    throw new Error(`Buyer feed request failed with ${response.status()}`);
  }

  return (await response.json()) as BuyerFeedSnapshot;
}
