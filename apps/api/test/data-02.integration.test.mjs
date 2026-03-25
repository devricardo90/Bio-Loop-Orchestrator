import assert from "node:assert/strict";
import { loadSwedenSupermarketDataset } from "../prisma/import-real-data.mjs";

async function main() {
  const dataset = loadSwedenSupermarketDataset();

  assert.equal(dataset.summary.stores, 5);
  assert.equal(dataset.summary.categories, 5);
  assert.equal(dataset.summary.buyers, 5);
  assert.equal(dataset.summary.interests, 8);
  assert.equal(dataset.summary.lots, 5);
  assert.deepEqual(dataset.summary.fallbackLots, ["LOT-003", "LOT-004", "LOT-005"]);

  const ica = dataset.stores.find((store) => store.id === "ica-maxi-solna");
  assert.equal(ica.brandName, "ICA");
  assert.equal(ica.pickupWindows.length, 2);
  assert.equal(ica.contacts.length, 1);

  const bakery = dataset.categories.find((category) => category.id === "bakery_surplus");
  assert.equal(bakery.storageCondition, "DRY");
  assert.equal(bakery.rulesDefault.dataset, "sweden-supermarkets");

  const buyer = dataset.buyers.find((entry) => entry.id === "uppsala-farm-co");
  assert.equal(buyer.approval.status, "PENDING");
  assert.deepEqual(buyer.interests, ["bakery_surplus", "produce_veggies"]);

  const dailyLot = dataset.lots.find((lot) => lot.id === "LOT-002");
  assert.equal(dailyLot.metadata.pickupWindowDerivation.mode, "store_window");
  assert.equal(dailyLot.metadata.pickupWindowDerivation.reason, "daily_window");
  assert.equal(dailyLot.status, "LISTED");
  assert.equal(dailyLot.grade, "B");

  const fallbackLot = dataset.lots.find((lot) => lot.id === "LOT-005");
  assert.equal(fallbackLot.metadata.pickupWindowDerivation.mode, "expiry_fallback");
  assert.equal(fallbackLot.metadata.sourcePriceSek, "40.00");
}

await main();
