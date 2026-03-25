import { Prisma, PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

export const DATASET_KEY = "sweden-supermarkets";
export const DATASET_SOURCE = "sweden_real_import";
export const DATASET_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/real-data/sweden-supermarkets");
export const INCOMING_DIR = resolve(DATASET_DIR, "incoming");

export const STORAGE_CONDITION_BY_CATEGORY = {
  bakery_surplus: "DRY",
  produce_veggies: "COLD",
  dairy_short_date: "COLD",
  meat_near_exp: "COLD",
  dry_goods_damaged: "DRY"
};

const REQUIRED_FILES = {
  stores: {
    fileName: "stores.csv",
    requiredColumns: [
      "store_external_id",
      "store_name",
      "brand_name",
      "legal_entity_name",
      "country",
      "city",
      "full_address",
      "postal_code",
      "timezone",
      "latitude",
      "longitude",
      "default_currency",
      "active"
    ]
  },
  contacts: {
    fileName: "store_contacts.csv",
    requiredColumns: ["store_external_id", "contact_name", "role", "email", "phone"]
  },
  pickupWindows: {
    fileName: "pickup_windows.csv",
    requiredColumns: ["store_external_id", "day_of_week", "start_time", "end_time", "window_type"]
  },
  categories: {
    fileName: "categories.csv",
    requiredColumns: ["category_id", "name_en", "name_sv", "target_industry"]
  },
  buyers: {
    fileName: "buyers.csv",
    requiredColumns: ["buyer_id", "buyer_name", "type", "location_city", "interested_categories"]
  },
  lots: {
    fileName: "lots_initial.csv",
    requiredColumns: ["lot_id", "store_external_id", "category_id", "weight_kg", "price_sek", "expiry_timestamp"]
  }
};

const WEEKDAY_NAMES = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Daily"]);

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
        continue;
      }

      quoted = !quoted;
      continue;
    }

    if (character === "," && !quoted) {
      result.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current);
  return result.map((value) => value.trim());
}

function parseCsvFile(filePath, requiredColumns) {
  const raw = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error(`CSV vazio ou incompleto: ${filePath}`);
  }

  const headers = splitCsvLine(lines[0]);

  for (const column of requiredColumns) {
    if (!headers.includes(column)) {
      throw new Error(`Coluna obrigatoria ausente em ${filePath}: ${column}`);
    }
  }

  return lines.slice(1).map((line, rowIndex) => {
    const values = splitCsvLine(line);
    if (values.length !== headers.length) {
      throw new Error(`Linha ${rowIndex + 2} invalida em ${filePath}: ${line}`);
    }

    return Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex]]));
  });
}

function assertUnique(rows, key, label) {
  const seen = new Set();
  for (const row of rows) {
    const value = row[key];
    if (seen.has(value)) {
      throw new Error(`Duplicidade em ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function normalizeBoolean(value, label) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Booleano invalido para ${label}: ${value}`);
}

function decimal(value, label) {
  if (value === "") {
    return null;
  }

  if (!/^-?\d+(\.\d+)?$/.test(value)) {
    throw new Error(`Decimal invalido para ${label}: ${value}`);
  }

  return new Prisma.Decimal(value);
}

function getLocalDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const values = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function zonedDateTimeToUtc({ year, month, day, hour, minute, second = 0 }, timeZone) {
  let guess = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const local = getLocalDateParts(new Date(guess), timeZone);
    const desiredEpoch = Date.UTC(year, month - 1, day, hour, minute, second);
    const currentEpoch = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
    const delta = desiredEpoch - currentEpoch;

    if (delta === 0) {
      return new Date(guess);
    }

    guess += delta;
  }

  return new Date(guess);
}

function getWeekdayName(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(date);
}

function parseTime(value, label) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Horario invalido para ${label}: ${value}`);
  }

  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function createDatasetMetadata(kind, externalId, extra = {}) {
  return {
    source: DATASET_SOURCE,
    dataset: DATASET_KEY,
    importedEntity: kind,
    externalId,
    ...extra
  };
}

function normalizeWindowRow(row) {
  if (!WEEKDAY_NAMES.has(row.day_of_week)) {
    throw new Error(`Dia da semana invalido em pickup_windows.csv: ${row.day_of_week}`);
  }

  parseTime(row.start_time, `pickup_windows:${row.store_external_id}:start_time`);
  parseTime(row.end_time, `pickup_windows:${row.store_external_id}:end_time`);

  return {
    storeExternalId: row.store_external_id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    windowType: row.window_type
  };
}

function derivePickupWindow(expiryAt, store) {
  const weekday = getWeekdayName(expiryAt, store.timezone);
  const matchingWindow =
    store.pickupWindows.find((window) => window.dayOfWeek === weekday) ??
    store.pickupWindows.find((window) => window.dayOfWeek === "Daily") ??
    null;

  if (!matchingWindow) {
    return {
      startAt: new Date(expiryAt.getTime() - 2 * 60 * 60 * 1000),
      endAt: expiryAt,
      derivation: {
        mode: "expiry_fallback",
        reason: "no_store_window_match",
        matchedDay: null
      }
    };
  }

  const localExpiry = getLocalDateParts(expiryAt, store.timezone);
  const startTime = parseTime(matchingWindow.startTime, `pickup_windows:${store.id}:start_time`);
  const endTime = parseTime(matchingWindow.endTime, `pickup_windows:${store.id}:end_time`);
  const startAt = zonedDateTimeToUtc(
    { year: localExpiry.year, month: localExpiry.month, day: localExpiry.day, hour: startTime.hour, minute: startTime.minute },
    store.timezone
  );
  const endCandidate = zonedDateTimeToUtc(
    { year: localExpiry.year, month: localExpiry.month, day: localExpiry.day, hour: endTime.hour, minute: endTime.minute },
    store.timezone
  );
  const endAt = endCandidate.getTime() <= expiryAt.getTime() ? endCandidate : expiryAt;

  if (startAt.getTime() >= endAt.getTime()) {
    return {
      startAt: new Date(expiryAt.getTime() - 2 * 60 * 60 * 1000),
      endAt: expiryAt,
      derivation: {
        mode: "expiry_fallback",
        reason: "window_after_expiry",
        matchedDay: matchingWindow.dayOfWeek
      }
    };
  }

  return {
    startAt,
    endAt,
    derivation: {
      mode: "store_window",
      reason: matchingWindow.dayOfWeek === "Daily" ? "daily_window" : "weekday_window",
      matchedDay: matchingWindow.dayOfWeek,
      windowType: matchingWindow.windowType
    }
  };
}

function buildRelations(rows, key) {
  const index = new Map();
  for (const row of rows) {
    const list = index.get(row[key]) ?? [];
    list.push(row);
    index.set(row[key], list);
  }
  return index;
}

export function loadSwedenSupermarketDataset(baseDir = INCOMING_DIR) {
  const storesRows = parseCsvFile(resolve(baseDir, REQUIRED_FILES.stores.fileName), REQUIRED_FILES.stores.requiredColumns);
  const contactRows = parseCsvFile(resolve(baseDir, REQUIRED_FILES.contacts.fileName), REQUIRED_FILES.contacts.requiredColumns);
  const pickupWindowRows = parseCsvFile(
    resolve(baseDir, REQUIRED_FILES.pickupWindows.fileName),
    REQUIRED_FILES.pickupWindows.requiredColumns
  );
  const categoryRows = parseCsvFile(resolve(baseDir, REQUIRED_FILES.categories.fileName), REQUIRED_FILES.categories.requiredColumns);
  const buyerRows = parseCsvFile(resolve(baseDir, REQUIRED_FILES.buyers.fileName), REQUIRED_FILES.buyers.requiredColumns);
  const lotRows = parseCsvFile(resolve(baseDir, REQUIRED_FILES.lots.fileName), REQUIRED_FILES.lots.requiredColumns);

  assertUnique(storesRows, "store_external_id", "stores.csv");
  assertUnique(categoryRows, "category_id", "categories.csv");
  assertUnique(buyerRows, "buyer_id", "buyers.csv");
  assertUnique(lotRows, "lot_id", "lots_initial.csv");

  const storeIds = new Set(storesRows.map((row) => row.store_external_id));

  for (const contactRow of contactRows) {
    if (!storeIds.has(contactRow.store_external_id)) {
      throw new Error(`Contato referencia store inexistente: ${contactRow.store_external_id}`);
    }
  }

  for (const pickupWindowRow of pickupWindowRows) {
    if (!storeIds.has(pickupWindowRow.store_external_id)) {
      throw new Error(`Pickup window referencia store inexistente: ${pickupWindowRow.store_external_id}`);
    }
  }

  const contactsByStore = buildRelations(contactRows, "store_external_id");
  const windowsByStore = buildRelations(pickupWindowRows.map(normalizeWindowRow), "storeExternalId");
  const categoriesById = new Map(categoryRows.map((row) => [row.category_id, row]));

  const stores = storesRows.map((row) => {
    const storeWindows = windowsByStore.get(row.store_external_id) ?? [];
    const contacts = (contactsByStore.get(row.store_external_id) ?? []).map((contact) => ({
      name: contact.contact_name,
      role: contact.role,
      email: contact.email,
      phone: contact.phone
    }));

    return {
      id: row.store_external_id,
      externalId: row.store_external_id,
      name: row.store_name,
      brandName: row.brand_name,
      legalEntityName: row.legal_entity_name,
      countryCode: row.country,
      city: row.city,
      address: row.full_address,
      postalCode: row.postal_code,
      timezone: row.timezone,
      latitude: decimal(row.latitude, `stores:${row.store_external_id}:latitude`),
      longitude: decimal(row.longitude, `stores:${row.store_external_id}:longitude`),
      defaultCurrency: row.default_currency,
      isActive: normalizeBoolean(row.active, `stores:${row.store_external_id}:active`),
      contacts,
      pickupWindows: storeWindows.map((window) => ({
        dayOfWeek: window.dayOfWeek,
        startTime: window.startTime,
        endTime: window.endTime,
        windowType: window.windowType
      })),
      metadata: createDatasetMetadata("store", row.store_external_id)
    };
  });

  const storesById = new Map(stores.map((store) => [store.id, store]));
  const categories = categoryRows.map((row) => {
    const storageCondition = STORAGE_CONDITION_BY_CATEGORY[row.category_id];
    if (!storageCondition) {
      throw new Error(`storageCondition indefinido para categoria ${row.category_id}`);
    }

    return {
      id: row.category_id,
      externalId: row.category_id,
      name: row.name_en,
      localizedNameSv: row.name_sv,
      targetIndustry: row.target_industry,
      storageCondition,
      rulesDefault: {
        source: DATASET_SOURCE,
        dataset: DATASET_KEY,
        localizedNameSv: row.name_sv,
        targetIndustry: row.target_industry
      }
    };
  });

  const categoryIds = new Set(categories.map((category) => category.id));
  const buyers = buyerRows.map((row) => {
    const categoryIdsForBuyer = row.interested_categories
      .split(";")
      .map((value) => value.trim())
      .filter(Boolean);

    for (const categoryId of categoryIdsForBuyer) {
      if (!categoryIds.has(categoryId)) {
        throw new Error(`Buyer ${row.buyer_id} referencia categoria inexistente: ${categoryId}`);
      }
    }

    return {
      id: row.buyer_id,
      externalId: row.buyer_id,
      name: row.buyer_name,
      buyerType: row.type,
      city: row.location_city,
      approved: false,
      radiusKmDefault: 0,
      reputation: 0,
      metadata: createDatasetMetadata("buyer", row.buyer_id),
      approval: {
        status: "PENDING",
        reason: "MANUAL_REVIEW",
        notes: `Imported from ${DATASET_KEY}`
      },
      interests: categoryIdsForBuyer
    };
  });

  const lots = lotRows.map((row) => {
    const store = storesById.get(row.store_external_id);
    if (!store) {
      throw new Error(`Lot ${row.lot_id} referencia store inexistente: ${row.store_external_id}`);
    }

    const category = categoriesById.get(row.category_id);
    if (!category) {
      throw new Error(`Lot ${row.lot_id} referencia categoria inexistente: ${row.category_id}`);
    }

    const expiryAt = new Date(row.expiry_timestamp);
    if (Number.isNaN(expiryAt.getTime())) {
      throw new Error(`expiry_timestamp invalido para lot ${row.lot_id}: ${row.expiry_timestamp}`);
    }

    const pickupWindow = derivePickupWindow(expiryAt, store);

    return {
      id: row.lot_id,
      externalId: row.lot_id,
      storeId: store.id,
      categoryId: row.category_id,
      storageCondition: STORAGE_CONDITION_BY_CATEGORY[row.category_id],
      pickupWindowStartAt: pickupWindow.startAt,
      pickupWindowEndAt: pickupWindow.endAt,
      estimatedWeightKg: decimal(row.weight_kg, `lots:${row.lot_id}:weight_kg`),
      finalWeightKg: null,
      grade: "B",
      status: "LISTED",
      sourceExpiresAt: expiryAt,
      metadata: createDatasetMetadata("lot", row.lot_id, {
        sourcePriceSek: row.price_sek,
        pickupWindowDerivation: pickupWindow.derivation
      })
    };
  });

  const fallbackLots = lots.filter((lot) => lot.metadata.pickupWindowDerivation.mode === "expiry_fallback").map((lot) => lot.id);

  return {
    dataset: DATASET_KEY,
    source: DATASET_SOURCE,
    stores,
    categories,
    buyers,
    lots,
    summary: {
      stores: stores.length,
      categories: categories.length,
      buyers: buyers.length,
      interests: buyers.reduce((total, buyer) => total + buyer.interests.length, 0),
      lots: lots.length,
      fallbackLots
    }
  };
}

async function findImportedIds(tx, model) {
  const rows = await tx[model].findMany({
    where: {
      metadata: {
        path: ["dataset"],
        equals: DATASET_KEY
      }
    },
    select: {
      id: true
    }
  });

  return rows.map((row) => row.id);
}

async function findImportedCategoryIds(tx) {
  const rows = await tx.commodityCategory.findMany({
    where: {
      rulesDefault: {
        path: ["dataset"],
        equals: DATASET_KEY
      }
    },
    select: {
      id: true
    }
  });

  return rows.map((row) => row.id);
}

export async function syncSwedenSupermarketDataset(client, dataset) {
  return client.$transaction(async (tx) => {
    const existing = {
      stores: await findImportedIds(tx, "store"),
      categories: await findImportedCategoryIds(tx),
      buyers: await findImportedIds(tx, "buyer"),
      lots: await findImportedIds(tx, "lot")
    };

    const current = {
      stores: dataset.stores.map((store) => store.id),
      categories: dataset.categories.map((category) => category.id),
      buyers: dataset.buyers.map((buyer) => buyer.id),
      lots: dataset.lots.map((lot) => lot.id)
    };

    const stale = {
      stores: existing.stores.filter((id) => !current.stores.includes(id)),
      categories: existing.categories.filter((id) => !current.categories.includes(id)),
      buyers: existing.buyers.filter((id) => !current.buyers.includes(id)),
      lots: existing.lots.filter((id) => !current.lots.includes(id))
    };

    if (stale.lots.length > 0) {
      await tx.lot.deleteMany({ where: { id: { in: stale.lots } } });
    }

    if (stale.buyers.length > 0) {
      await tx.buyer.deleteMany({ where: { id: { in: stale.buyers } } });
    }

    if (stale.categories.length > 0) {
      await tx.commodityCategory.deleteMany({ where: { id: { in: stale.categories } } });
    }

    if (stale.stores.length > 0) {
      await tx.store.deleteMany({ where: { id: { in: stale.stores } } });
    }

    for (const store of dataset.stores) {
      await tx.store.upsert({
        where: { id: store.id },
        create: store,
        update: {
          externalId: store.externalId,
          name: store.name,
          brandName: store.brandName,
          legalEntityName: store.legalEntityName,
          countryCode: store.countryCode,
          city: store.city,
          address: store.address,
          postalCode: store.postalCode,
          timezone: store.timezone,
          latitude: store.latitude,
          longitude: store.longitude,
          defaultCurrency: store.defaultCurrency,
          isActive: store.isActive,
          contacts: store.contacts,
          pickupWindows: store.pickupWindows,
          metadata: store.metadata
        }
      });
    }

    for (const category of dataset.categories) {
      await tx.commodityCategory.upsert({
        where: { id: category.id },
        create: category,
        update: {
          externalId: category.externalId,
          name: category.name,
          localizedNameSv: category.localizedNameSv,
          targetIndustry: category.targetIndustry,
          storageCondition: category.storageCondition,
          rulesDefault: category.rulesDefault
        }
      });
    }

    for (const buyer of dataset.buyers) {
      await tx.buyer.upsert({
        where: { id: buyer.id },
        create: {
          id: buyer.id,
          externalId: buyer.externalId,
          name: buyer.name,
          buyerType: buyer.buyerType,
          city: buyer.city,
          approved: buyer.approved,
          radiusKmDefault: buyer.radiusKmDefault,
          reputation: buyer.reputation,
          metadata: buyer.metadata
        },
        update: {
          externalId: buyer.externalId,
          name: buyer.name,
          buyerType: buyer.buyerType,
          city: buyer.city,
          approved: buyer.approved,
          radiusKmDefault: buyer.radiusKmDefault,
          reputation: buyer.reputation,
          metadata: buyer.metadata
        }
      });

      await tx.buyerApproval.upsert({
        where: { buyerId: buyer.id },
        create: {
          buyerId: buyer.id,
          status: buyer.approval.status,
          reason: buyer.approval.reason,
          notes: buyer.approval.notes
        },
        update: {
          status: buyer.approval.status,
          reason: buyer.approval.reason,
          notes: buyer.approval.notes,
          decision: null,
          reviewerId: null,
          reviewedAt: null
        }
      });
    }

    if (current.buyers.length > 0) {
      await tx.buyerCategoryInterest.deleteMany({
        where: {
          buyerId: { in: current.buyers }
        }
      });
    }

    const interestRows = dataset.buyers.flatMap((buyer) =>
      buyer.interests.map((categoryId) => ({
        buyerId: buyer.id,
        categoryId
      }))
    );

    if (interestRows.length > 0) {
      await tx.buyerCategoryInterest.createMany({
        data: interestRows,
        skipDuplicates: true
      });
    }

    for (const lot of dataset.lots) {
      await tx.lot.upsert({
        where: { id: lot.id },
        create: lot,
        update: {
          externalId: lot.externalId,
          storeId: lot.storeId,
          categoryId: lot.categoryId,
          storageCondition: lot.storageCondition,
          pickupWindowStartAt: lot.pickupWindowStartAt,
          pickupWindowEndAt: lot.pickupWindowEndAt,
          estimatedWeightKg: lot.estimatedWeightKg,
          finalWeightKg: null,
          grade: lot.grade,
          status: lot.status,
          sourceExpiresAt: lot.sourceExpiresAt,
          metadata: lot.metadata
        }
      });
    }

    return {
      imported: dataset.summary,
      staleRemoved: {
        stores: stale.stores.length,
        categories: stale.categories.length,
        buyers: stale.buyers.length,
        lots: stale.lots.length
      }
    };
  });
}

function parseArgs(argv) {
  return {
    apply: argv.includes("--apply")
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const dataset = loadSwedenSupermarketDataset();
  const summary = {
    mode: args.apply ? "apply" : "dry-run",
    dataset: dataset.dataset,
    source: dataset.source,
    ...dataset.summary
  };

  if (!args.apply) {
    console.log(JSON.stringify(summary, null, 2));
    console.log("Dry run complete. Use --apply to persist the Sweden supermarket dataset.");
    return;
  }

  const result = await syncSwedenSupermarketDataset(prisma, dataset);
  console.log(
    JSON.stringify(
      {
        ...summary,
        staleRemoved: result.staleRemoved
      },
      null,
      2
    )
  );
  console.log("Sweden supermarket dataset imported successfully.");
}

const isEntrypoint = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  try {
    await main();
  } finally {
    await prisma.$disconnect();
  }
}
