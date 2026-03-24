import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TradesService } from "../dist/trades/trades.service.js";

function createFakePrisma() {
  return {
    buyer: {
      findMany: async () => [
        {
          id: "buyer-grainworks",
          name: "GrainWorks AB",
          approved: true,
          reputation: 92,
          city: "Stockholm",
          metadata: { riskLabel: "Low risk" }
        },
        {
          id: "buyer-nova-brew",
          name: "Nova Brew Labs",
          approved: false,
          reputation: 44,
          city: "Stockholm",
          metadata: { riskLabel: "Pending approval" }
        }
      ]
    },
    auction: {
      findMany: async () => [
        {
          id: "auction-husks-01",
          lotId: "lot-husks-01",
          reservePriceSekPerKg: 4.75,
          startAt: new Date("2026-03-24T08:00:00.000Z"),
          endAt: new Date("2026-03-24T12:00:00.000Z"),
          status: "LIVE",
          highestBidId: "bid-husks-02",
          highestBid: {
            id: "bid-husks-02",
            auctionId: "auction-husks-01",
            buyerId: "buyer-grainworks",
            priceSekPerKg: 5.1,
            createdAt: new Date("2026-03-24T10:00:00.000Z")
          },
          bids: [
            {
              id: "bid-husks-01",
              auctionId: "auction-husks-01",
              buyerId: "buyer-nova-brew",
              priceSekPerKg: 4.9,
              createdAt: new Date("2026-03-24T09:30:00.000Z")
            },
            {
              id: "bid-husks-02",
              auctionId: "auction-husks-01",
              buyerId: "buyer-grainworks",
              priceSekPerKg: 5.1,
              createdAt: new Date("2026-03-24T10:00:00.000Z")
            }
          ],
          lot: {
            id: "lot-husks-01",
            storeId: "store-stockholm-central",
            categoryId: "cat-brewer-husk",
            storageCondition: "DRY",
            pickupWindowStartAt: new Date("2026-03-24T12:00:00.000Z"),
            pickupWindowEndAt: new Date("2026-03-24T14:00:00.000Z"),
            estimatedWeightKg: 840,
            finalWeightKg: null,
            grade: "B",
            status: "LISTED",
            store: {
              id: "store-stockholm-central",
              name: "Stockholm Central Market",
              latitude: 59.33258,
              longitude: 18.0649
            },
            category: {
              id: "cat-brewer-husk",
              name: "Brewer's husk",
              rulesDefault: { notes: "Primary live bidding scenario for industrial buyers." }
            },
            order: null
          }
        },
        {
          id: "auction-apples-01",
          lotId: "lot-apples-01",
          reservePriceSekPerKg: 3.4,
          startAt: new Date("2026-03-24T15:00:00.000Z"),
          endAt: new Date("2026-03-24T17:00:00.000Z"),
          status: "SCHEDULED",
          highestBidId: null,
          highestBid: null,
          bids: [],
          lot: {
            id: "lot-apples-01",
            storeId: "store-sodermalm",
            categoryId: "cat-pomace",
            storageCondition: "COLD",
            pickupWindowStartAt: new Date("2026-03-25T12:00:00.000Z"),
            pickupWindowEndAt: new Date("2026-03-25T14:00:00.000Z"),
            estimatedWeightKg: 1250,
            finalWeightKg: null,
            grade: "A",
            status: "LISTED",
            store: {
              id: "store-sodermalm",
              name: "Sodermalm Supermarket",
              latitude: 59.314884,
              longitude: 18.072474
            },
            category: {
              id: "cat-pomace",
              name: "Apple pomace",
              rulesDefault: { notes: "Scheduled auction scenario with no bids yet." }
            },
            order: null
          }
        }
      ]
    }
  };
}

async function main() {
  const controllerSource = readFileSync(new URL("../src/trades/trades.controller.ts", import.meta.url), "utf8");
  const serviceSource = readFileSync(new URL("../src/trades/trades.service.ts", import.meta.url), "utf8");

  assert.match(controllerSource, /@Get\("\/feed"\)/);
  assert.match(serviceSource, /listBuyerFeed/);
  assert.match(serviceSource, /getBuyerAuctionDetail/);

  const tradesService = new TradesService(createFakePrisma());
  const feed = await tradesService.listBuyerFeed();
  assert.equal(feed.source, "api");
  assert.equal(feed.activeBuyerId, "buyer-grainworks");
  assert.equal(feed.auctions[0].id, "auction-husks-01");
  assert.equal(feed.auctions[0].storeName, "Stockholm Central Market");
  assert.equal(feed.auctions[0].bids.length, 2);

  const detail = await tradesService.getBuyerAuctionDetail("auction-husks-01");
  assert.equal(detail.source, "api");
  assert.equal(detail.auction.id, "auction-husks-01");
  assert.equal(detail.relatedAuctions.length, 1);
}

await main();
