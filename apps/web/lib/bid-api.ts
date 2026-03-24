import { placeBidResponseSchema } from "@bio-loop/domain";

type PlaceBidInput = {
  auctionId: string;
  buyerId: string;
  priceSekPerKg: number;
};

const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export async function submitBidToApi(input: PlaceBidInput) {
  const response = await fetch(`${apiBaseUrl}/buyer/auctions/${input.auctionId}/bids`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Bid request failed with ${response.status}`);
  }

  return placeBidResponseSchema.parse((await response.json()) as unknown);
}
