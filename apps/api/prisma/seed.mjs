import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const currentIds = {
  users: {
    platformAdmin: "user_platform_admin",
    sellerAdmin: "user_seller_admin",
    buyerAdmin: "user_buyer_admin"
  },
  stores: {
    stockholmCentral: "store-stockholm-central",
    sodermalm: "store-sodermalm",
    norrmalm: "store-norrmalm",
    kungsholmen: "store-kungsholmen",
    uppsalaNorth: "store-uppsala-north"
  },
  categories: {
    brewerHusk: "cat-brewer-husk",
    pomace: "cat-pomace",
    carrotTrim: "cat-carrot-trim",
    greens: "cat-greens",
    beets: "cat-beets",
    rootMix: "cat-root-mix"
  },
  buyers: {
    grainworks: "buyer-grainworks",
    freshmart: "buyer-freshmart",
    novaBrew: "buyer-nova-brew",
    harborFood: "buyer-harbor-food"
  },
  approvals: {
    grainworks: "approval-grainworks",
    freshmart: "approval-freshmart",
    novaBrew: "approval-nova-brew",
    harborFood: "approval-harbor-food"
  },
  lots: {
    husks: "lot-husks-01",
    apples: "lot-apples-01",
    carrots: "lot-carrots-01",
    greens: "lot-greens-01",
    beets: "lot-beets-01",
    roots: "lot-roots-01"
  },
  auctions: {
    husks: "auction-husks-01",
    apples: "auction-apples-01",
    carrots: "auction-carrots-01",
    greens: "auction-greens-01",
    beets: "auction-beets-01",
    roots: "auction-roots-01"
  },
  bids: {
    husksOpening: "bid-husks-01",
    husksLead: "bid-husks-02",
    carrotsOpening: "bid-carrots-01",
    carrotsWinner: "bid-carrots-02",
    beetsWinner: "bid-beets-01",
    rootsWinner: "bid-roots-01"
  },
  orders: {
    carrots: "order-carrots-01",
    beets: "order-beets-01",
    roots: "order-roots-01"
  },
  proofs: {
    beets: "proof-beets-01"
  },
  disputes: {
    beets: "dispute-beets-01",
    roots: "dispute-roots-01"
  },
  resolutions: {
    beets: "resolution-beets-01"
  },
  invoices: {
    beets: "inv_order-beets-01"
  },
  invoiceFees: {
    beetsPlatform: "fee_order-beets-01_platform",
    beetsPickup: "fee_order-beets-01_pickup",
    beetsDispute: "fee_order-beets-01_dispute"
  },
  billingExports: {
    beets: "billing_export_beets_seed"
  },
  auditLogs: {
    grainworksApproval: "audit-grainworks-approval",
    harborSuspension: "audit-harbor-suspension",
    beetsResolution: "audit-beets-resolution"
  }
};

const legacyIds = {
  stores: ["store_norrmalm"],
  categories: ["category_carrots", "category_greens", "category_beets"],
  buyers: ["buyer_grainworks", "buyer_freshmart", "buyer_harvest_co"],
  approvals: ["approval_grainworks", "approval_freshmart", "approval_harvest_co"],
  lots: ["lot_carrots_settled", "lot_greens_live", "lot_beets_noshow"],
  auctions: ["auction_carrots_settled", "auction_greens_live", "auction_beets_noshow"],
  bids: ["bid_carrots_lead", "bid_carrots_close", "bid_greens_early", "bid_greens_lead", "bid_beets_lead"],
  orders: ["order_carrots_settled", "order_beets_noshow"],
  proofs: ["proof_carrots_settled"],
  disputes: ["dispute_carrots_quality", "dispute_beets_noshow"],
  resolutions: ["resolution_carrots_quality"],
  invoices: [],
  invoiceFees: [],
  billingExports: [],
  auditLogs: ["audit_buyer_approval", "audit_dispute_resolution"]
};

const now = new Date();

function days(offset) {
  return new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
}

function hours(offset) {
  return new Date(now.getTime() + offset * 60 * 60 * 1000);
}

function collectIds(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectIds(entry));
  }

  if (typeof value === "string") {
    return [value];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.values(value).flatMap((entry) => collectIds(entry));
}

async function clearManagedScenario(tx) {
  const managedIds = {
    users: collectIds(currentIds.users),
    stores: [...collectIds(currentIds.stores), ...legacyIds.stores],
    categories: [...collectIds(currentIds.categories), ...legacyIds.categories],
    buyers: [...collectIds(currentIds.buyers), ...legacyIds.buyers],
    approvals: [...collectIds(currentIds.approvals), ...legacyIds.approvals],
    lots: [...collectIds(currentIds.lots), ...legacyIds.lots],
    auctions: [...collectIds(currentIds.auctions), ...legacyIds.auctions],
    bids: [...collectIds(currentIds.bids), ...legacyIds.bids],
    orders: [...collectIds(currentIds.orders), ...legacyIds.orders],
    proofs: [...collectIds(currentIds.proofs), ...legacyIds.proofs],
    disputes: [...collectIds(currentIds.disputes), ...legacyIds.disputes],
    resolutions: [...collectIds(currentIds.resolutions), ...legacyIds.resolutions],
    invoices: [...collectIds(currentIds.invoices), ...legacyIds.invoices],
    invoiceFees: [...collectIds(currentIds.invoiceFees), ...legacyIds.invoiceFees],
    billingExports: [...collectIds(currentIds.billingExports), ...legacyIds.billingExports],
    auditLogs: [...collectIds(currentIds.auditLogs), ...legacyIds.auditLogs]
  };

  await tx.auditLog.deleteMany({ where: { id: { in: managedIds.auditLogs } } });
  await tx.billingExport.deleteMany({ where: { id: { in: managedIds.billingExports } } });
  await tx.disputeResolution.deleteMany({ where: { id: { in: managedIds.resolutions } } });
  await tx.buyerApproval.deleteMany({ where: { id: { in: managedIds.approvals } } });
  await tx.invoiceFee.deleteMany({ where: { id: { in: managedIds.invoiceFees } } });
  await tx.invoice.deleteMany({ where: { id: { in: managedIds.invoices } } });
  await tx.pickupProof.deleteMany({ where: { id: { in: managedIds.proofs } } });
  await tx.dispute.deleteMany({ where: { id: { in: managedIds.disputes } } });
  await tx.order.deleteMany({ where: { id: { in: managedIds.orders } } });
  await tx.bid.deleteMany({ where: { id: { in: managedIds.bids } } });
  await tx.auction.deleteMany({ where: { id: { in: managedIds.auctions } } });
  await tx.lot.deleteMany({ where: { id: { in: managedIds.lots } } });
  await tx.buyer.deleteMany({ where: { id: { in: managedIds.buyers } } });
  await tx.commodityCategory.deleteMany({ where: { id: { in: managedIds.categories } } });
  await tx.store.deleteMany({ where: { id: { in: managedIds.stores } } });
  await tx.user.deleteMany({ where: { id: { in: managedIds.users } } });
}

function decimal(value) {
  return new Prisma.Decimal(value);
}

async function seedUsers(tx) {
  await tx.user.createMany({
    data: [
      {
        id: currentIds.users.platformAdmin,
        email: "platform.admin@bioloop.dev",
        name: "Platform Admin",
        role: "PLATFORM_ADMIN"
      },
      {
        id: currentIds.users.sellerAdmin,
        email: "seller.admin@bioloop.dev",
        name: "Seller Admin",
        role: "SELLER_ADMIN"
      },
      {
        id: currentIds.users.buyerAdmin,
        email: "buyer.admin@bioloop.dev",
        name: "Buyer Admin",
        role: "BUYER_ADMIN"
      }
    ]
  });
}

async function seedStores(tx) {
  await tx.store.createMany({
    data: [
      {
        id: currentIds.stores.stockholmCentral,
        externalId: currentIds.stores.stockholmCentral,
        name: "Stockholm Central Market",
        brandName: "Bio Loop Demo",
        legalEntityName: "Bio Loop Demo Retail AB",
        countryCode: "SE",
        city: "Stockholm",
        address: "Klara Vastra Kyrkogata 20, Stockholm",
        postalCode: "11152",
        timezone: "Europe/Stockholm",
        latitude: decimal("59.332580"),
        longitude: decimal("18.064900"),
        defaultCurrency: "SEK",
        isActive: true,
        contacts: { phone: "+46-8-555-0101", email: "ops@stockholm-central.local" },
        pickupWindows: { standard: { start: "10:00", end: "14:00" }, rush: { start: "14:00", end: "18:00" } },
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.stores.sodermalm,
        externalId: currentIds.stores.sodermalm,
        name: "Sodermalm Supermarket",
        brandName: "Bio Loop Demo",
        legalEntityName: "Bio Loop Demo Retail AB",
        countryCode: "SE",
        city: "Stockholm",
        address: "Gotalandsgatan 15, Stockholm",
        postalCode: "11846",
        timezone: "Europe/Stockholm",
        latitude: decimal("59.314884"),
        longitude: decimal("18.072474"),
        defaultCurrency: "SEK",
        isActive: true,
        contacts: { phone: "+46-8-555-0102", email: "ops@sodermalm.local" },
        pickupWindows: { standard: { start: "16:00", end: "20:00" } },
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.stores.norrmalm,
        externalId: currentIds.stores.norrmalm,
        name: "Norrmalm Fresh Depot",
        brandName: "Bio Loop Demo",
        legalEntityName: "Bio Loop Demo Retail AB",
        countryCode: "SE",
        city: "Stockholm",
        address: "Birger Jarlsgatan 10, Stockholm",
        postalCode: "11434",
        timezone: "Europe/Stockholm",
        latitude: decimal("59.337575"),
        longitude: decimal("18.072060"),
        defaultCurrency: "SEK",
        isActive: true,
        contacts: { phone: "+46-8-555-0103", email: "ops@norrmalm.local" },
        pickupWindows: { standard: { start: "08:00", end: "12:00" } },
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.stores.kungsholmen,
        externalId: currentIds.stores.kungsholmen,
        name: "Kungsholmen Organic Hall",
        brandName: "Bio Loop Demo",
        legalEntityName: "Bio Loop Demo Retail AB",
        countryCode: "SE",
        city: "Stockholm",
        address: "Fleminggatan 42, Stockholm",
        postalCode: "11233",
        timezone: "Europe/Stockholm",
        latitude: decimal("59.332380"),
        longitude: decimal("18.036410"),
        defaultCurrency: "SEK",
        isActive: true,
        contacts: { phone: "+46-8-555-0104", email: "ops@kungsholmen.local" },
        pickupWindows: { standard: { start: "07:00", end: "11:00" } },
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.stores.uppsalaNorth,
        externalId: currentIds.stores.uppsalaNorth,
        name: "Uppsala North Depot",
        brandName: "Bio Loop Demo",
        legalEntityName: "Bio Loop Demo Retail AB",
        countryCode: "SE",
        city: "Uppsala",
        address: "Bolandsgatan 8, Uppsala",
        postalCode: "75323",
        timezone: "Europe/Stockholm",
        latitude: decimal("59.847940"),
        longitude: decimal("17.684910"),
        defaultCurrency: "SEK",
        isActive: true,
        contacts: { phone: "+46-18-555-0105", email: "ops@uppsala-north.local" },
        pickupWindows: { standard: { start: "06:00", end: "09:00" } },
        metadata: { source: "scenario_seed" }
      }
    ]
  });
}

async function seedCategories(tx) {
  await tx.commodityCategory.createMany({
    data: [
      {
        id: currentIds.categories.brewerHusk,
        externalId: currentIds.categories.brewerHusk,
        name: "Brewer's husk",
        localizedNameSv: "Bryggerirest",
        targetIndustry: "Brewery",
        storageCondition: "DRY",
        rulesDefault: {
          minWeightKg: 500,
          maxDaysToPickup: 1,
          notes: "Primary live bidding scenario for industrial buyers."
        }
      },
      {
        id: currentIds.categories.pomace,
        externalId: currentIds.categories.pomace,
        name: "Apple pomace",
        localizedNameSv: "Appelpressmassa",
        targetIndustry: "Biofuel",
        storageCondition: "COLD",
        rulesDefault: {
          minWeightKg: 1000,
          maxDaysToPickup: 2,
          notes: "Scheduled auction scenario with no bids yet."
        }
      },
      {
        id: currentIds.categories.carrotTrim,
        externalId: currentIds.categories.carrotTrim,
        name: "Carrot trim",
        localizedNameSv: "Morotsspill",
        targetIndustry: "AnimalFeed",
        storageCondition: "FROZEN",
        rulesDefault: {
          minWeightKg: 400,
          maxDaysToPickup: 1,
          notes: "Awarded order with pickup already scheduled."
        }
      },
      {
        id: currentIds.categories.greens,
        externalId: currentIds.categories.greens,
        name: "Leafy trim",
        localizedNameSv: "Bladgront spill",
        targetIndustry: "Compost",
        storageCondition: "DRY",
        rulesDefault: {
          minWeightKg: 200,
          maxDaysToPickup: 1,
          notes: "Void auction scenario for buyer edge-state handling."
        }
      },
      {
        id: currentIds.categories.beets,
        externalId: currentIds.categories.beets,
        name: "Beets",
        localizedNameSv: "Betor",
        targetIndustry: "FoodProcessing",
        storageCondition: "DRY",
        rulesDefault: {
          minWeightKg: 150,
          maxDaysToPickup: 4,
          notes: "Settled billing and resolved dispute scenario."
        }
      },
      {
        id: currentIds.categories.rootMix,
        externalId: currentIds.categories.rootMix,
        name: "Root mix",
        localizedNameSv: "Rotmix",
        targetIndustry: "Biofuel",
        storageCondition: "COLD",
        rulesDefault: {
          minWeightKg: 250,
          maxDaysToPickup: 2,
          notes: "Open no-show dispute scenario for admin resolution."
        }
      }
    ]
  });
}

async function seedBuyers(tx) {
  await tx.buyer.createMany({
    data: [
      {
        id: currentIds.buyers.grainworks,
        externalId: currentIds.buyers.grainworks,
        name: "GrainWorks AB",
        buyerType: "BREWERY",
        city: "Stockholm",
        approved: true,
        radiusKmDefault: 120,
        reputation: 92,
        metadata: {
          source: "scenario_seed",
          contactEmail: "ops@grainworks.example",
          riskLabel: "Low risk"
        }
      },
      {
        id: currentIds.buyers.freshmart,
        externalId: currentIds.buyers.freshmart,
        name: "FreshMart Logistics",
        buyerType: "LOGISTICS",
        city: "Stockholm",
        approved: false,
        radiusKmDefault: 90,
        reputation: 74,
        metadata: {
          source: "scenario_seed",
          contactEmail: "ops@freshmart.example",
          riskLabel: "Needs review"
        }
      },
      {
        id: currentIds.buyers.novaBrew,
        externalId: currentIds.buyers.novaBrew,
        name: "Nova Brew Labs",
        buyerType: "BREWERY",
        city: "Stockholm",
        approved: false,
        radiusKmDefault: 45,
        reputation: 44,
        metadata: {
          source: "scenario_seed",
          contactEmail: "ops@novabrew.example",
          riskLabel: "Pending approval"
        }
      },
      {
        id: currentIds.buyers.harborFood,
        externalId: currentIds.buyers.harborFood,
        name: "Harbor Food Systems",
        buyerType: "FOOD_SERVICE",
        city: "Uppsala",
        approved: false,
        radiusKmDefault: 60,
        reputation: 61,
        metadata: {
          source: "scenario_seed",
          contactEmail: "compliance@harborfood.example",
          riskLabel: "Payment risk"
        }
      }
    ]
  });

  await tx.buyerApproval.createMany({
    data: [
      {
        id: currentIds.approvals.grainworks,
        buyerId: currentIds.buyers.grainworks,
        status: "APPROVED",
        decision: "APPROVE",
        reason: "MANUAL_REVIEW",
        reviewerId: currentIds.users.platformAdmin,
        reviewedAt: days(-12),
        notes: "Approved seed buyer for live auction and pickup scenarios."
      },
      {
        id: currentIds.approvals.freshmart,
        buyerId: currentIds.buyers.freshmart,
        status: "PENDING",
        decision: null,
        reason: null,
        reviewerId: null,
        reviewedAt: null,
        notes: "Pending manual review in the admin workspace."
      },
      {
        id: currentIds.approvals.novaBrew,
        buyerId: currentIds.buyers.novaBrew,
        status: "PENDING",
        decision: null,
        reason: null,
        reviewerId: null,
        reviewedAt: null,
        notes: "Pending approval for the buyer demo persona."
      },
      {
        id: currentIds.approvals.harborFood,
        buyerId: currentIds.buyers.harborFood,
        status: "SUSPENDED",
        decision: "SUSPEND",
        reason: "PAYMENT_RISK",
        reviewerId: currentIds.users.platformAdmin,
        reviewedAt: days(-4),
        notes: "Suspended while payment reconciliation is pending."
      }
    ]
  });

  await tx.buyerCategoryInterest.createMany({
    data: [
      {
        buyerId: currentIds.buyers.grainworks,
        categoryId: currentIds.categories.brewerHusk
      },
      {
        buyerId: currentIds.buyers.freshmart,
        categoryId: currentIds.categories.beets
      },
      {
        buyerId: currentIds.buyers.novaBrew,
        categoryId: currentIds.categories.brewerHusk
      },
      {
        buyerId: currentIds.buyers.harborFood,
        categoryId: currentIds.categories.rootMix
      }
    ]
  });
}

async function seedLotsAndAuctions(tx) {
  await tx.lot.createMany({
    data: [
      {
        id: currentIds.lots.husks,
        externalId: currentIds.lots.husks,
        storeId: currentIds.stores.stockholmCentral,
        categoryId: currentIds.categories.brewerHusk,
        storageCondition: "DRY",
        pickupWindowStartAt: hours(2),
        pickupWindowEndAt: hours(4),
        estimatedWeightKg: decimal("840.000"),
        finalWeightKg: null,
        grade: "B",
        status: "LISTED",
        sourceExpiresAt: hours(4),
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.lots.apples,
        externalId: currentIds.lots.apples,
        storeId: currentIds.stores.sodermalm,
        categoryId: currentIds.categories.pomace,
        storageCondition: "COLD",
        pickupWindowStartAt: days(1),
        pickupWindowEndAt: days(1.25),
        estimatedWeightKg: decimal("1250.000"),
        finalWeightKg: null,
        grade: "A",
        status: "LISTED",
        sourceExpiresAt: days(1.25),
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.lots.carrots,
        externalId: currentIds.lots.carrots,
        storeId: currentIds.stores.norrmalm,
        categoryId: currentIds.categories.carrotTrim,
        storageCondition: "FROZEN",
        pickupWindowStartAt: hours(5),
        pickupWindowEndAt: hours(7),
        estimatedWeightKg: decimal("560.000"),
        finalWeightKg: decimal("548.000"),
        grade: "A",
        status: "PICKUP_SCHEDULED",
        sourceExpiresAt: hours(7),
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.lots.greens,
        externalId: currentIds.lots.greens,
        storeId: currentIds.stores.kungsholmen,
        categoryId: currentIds.categories.greens,
        storageCondition: "DRY",
        pickupWindowStartAt: hours(-9),
        pickupWindowEndAt: hours(-5),
        estimatedWeightKg: decimal("310.000"),
        finalWeightKg: null,
        grade: "C",
        status: "EXPIRED",
        sourceExpiresAt: hours(-5),
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.lots.beets,
        externalId: currentIds.lots.beets,
        storeId: currentIds.stores.uppsalaNorth,
        categoryId: currentIds.categories.beets,
        storageCondition: "DRY",
        pickupWindowStartAt: days(-2),
        pickupWindowEndAt: days(-1.75),
        estimatedWeightKg: decimal("540.000"),
        finalWeightKg: decimal("548.000"),
        grade: "A",
        status: "COMPLETED",
        sourceExpiresAt: days(-1.75),
        metadata: { source: "scenario_seed" }
      },
      {
        id: currentIds.lots.roots,
        externalId: currentIds.lots.roots,
        storeId: currentIds.stores.norrmalm,
        categoryId: currentIds.categories.rootMix,
        storageCondition: "COLD",
        pickupWindowStartAt: hours(-30),
        pickupWindowEndAt: hours(-26),
        estimatedWeightKg: decimal("275.000"),
        finalWeightKg: null,
        grade: "B",
        status: "PICKUP_SCHEDULED",
        sourceExpiresAt: hours(-26),
        metadata: { source: "scenario_seed" }
      }
    ]
  });

  await tx.auction.createMany({
    data: [
      {
        id: currentIds.auctions.husks,
        lotId: currentIds.lots.husks,
        startAt: hours(-0.5),
        endAt: hours(1.5),
        reservePriceSekPerKg: decimal("4.75"),
        status: "LIVE",
        highestBidId: null
      },
      {
        id: currentIds.auctions.apples,
        lotId: currentIds.lots.apples,
        startAt: hours(0.5),
        endAt: hours(2),
        reservePriceSekPerKg: decimal("3.40"),
        status: "SCHEDULED",
        highestBidId: null
      },
      {
        id: currentIds.auctions.carrots,
        lotId: currentIds.lots.carrots,
        startAt: hours(-5),
        endAt: hours(-2),
        reservePriceSekPerKg: decimal("6.20"),
        status: "ENDED",
        highestBidId: null
      },
      {
        id: currentIds.auctions.greens,
        lotId: currentIds.lots.greens,
        startAt: hours(-10),
        endAt: hours(-6),
        reservePriceSekPerKg: decimal("2.10"),
        status: "VOID",
        highestBidId: null
      },
      {
        id: currentIds.auctions.beets,
        lotId: currentIds.lots.beets,
        startAt: days(-4),
        endAt: days(-3.5),
        reservePriceSekPerKg: decimal("6.50"),
        status: "ENDED",
        highestBidId: null
      },
      {
        id: currentIds.auctions.roots,
        lotId: currentIds.lots.roots,
        startAt: hours(-36),
        endAt: hours(-32),
        reservePriceSekPerKg: decimal("4.20"),
        status: "ENDED",
        highestBidId: null
      }
    ]
  });
}

async function seedBids(tx) {
  await tx.bid.createMany({
    data: [
      {
        id: currentIds.bids.husksOpening,
        auctionId: currentIds.auctions.husks,
        buyerId: currentIds.buyers.novaBrew,
        priceSekPerKg: decimal("4.90"),
        createdAt: hours(-0.25)
      },
      {
        id: currentIds.bids.husksLead,
        auctionId: currentIds.auctions.husks,
        buyerId: currentIds.buyers.grainworks,
        priceSekPerKg: decimal("5.10"),
        createdAt: hours(-0.1)
      },
      {
        id: currentIds.bids.carrotsOpening,
        auctionId: currentIds.auctions.carrots,
        buyerId: currentIds.buyers.novaBrew,
        priceSekPerKg: decimal("6.40"),
        createdAt: hours(-4)
      },
      {
        id: currentIds.bids.carrotsWinner,
        auctionId: currentIds.auctions.carrots,
        buyerId: currentIds.buyers.grainworks,
        priceSekPerKg: decimal("6.80"),
        createdAt: hours(-3)
      },
      {
        id: currentIds.bids.beetsWinner,
        auctionId: currentIds.auctions.beets,
        buyerId: currentIds.buyers.freshmart,
        priceSekPerKg: decimal("7.10"),
        createdAt: days(-3.75)
      },
      {
        id: currentIds.bids.rootsWinner,
        auctionId: currentIds.auctions.roots,
        buyerId: currentIds.buyers.harborFood,
        priceSekPerKg: decimal("4.50"),
        createdAt: hours(-34)
      }
    ]
  });

  await tx.auction.update({
    where: { id: currentIds.auctions.husks },
    data: { highestBidId: currentIds.bids.husksLead }
  });
  await tx.auction.update({
    where: { id: currentIds.auctions.carrots },
    data: { highestBidId: currentIds.bids.carrotsWinner }
  });
  await tx.auction.update({
    where: { id: currentIds.auctions.beets },
    data: { highestBidId: currentIds.bids.beetsWinner }
  });
  await tx.auction.update({
    where: { id: currentIds.auctions.roots },
    data: { highestBidId: currentIds.bids.rootsWinner }
  });
}

async function seedOrdersAndDisputes(tx) {
  await tx.order.createMany({
    data: [
      {
        id: currentIds.orders.carrots,
        lotId: currentIds.lots.carrots,
        buyerId: currentIds.buyers.grainworks,
        finalPriceSekPerKg: decimal("6.80"),
        status: "CONFIRMED",
        pickupStatus: "SCHEDULED",
        pickupWindowStartAt: hours(5),
        pickupWindowEndAt: hours(7),
        pickupScheduledAt: hours(-1),
        pickupCompletedAt: null
      },
      {
        id: currentIds.orders.beets,
        lotId: currentIds.lots.beets,
        buyerId: currentIds.buyers.freshmart,
        finalPriceSekPerKg: decimal("7.10"),
        status: "SETTLED",
        pickupStatus: "COMPLETED",
        pickupWindowStartAt: days(-2),
        pickupWindowEndAt: days(-1.75),
        pickupScheduledAt: days(-2),
        pickupCompletedAt: days(-1.75)
      },
      {
        id: currentIds.orders.roots,
        lotId: currentIds.lots.roots,
        buyerId: currentIds.buyers.harborFood,
        finalPriceSekPerKg: decimal("4.50"),
        status: "IN_DISPUTE",
        pickupStatus: "NO_SHOW",
        pickupWindowStartAt: hours(-30),
        pickupWindowEndAt: hours(-26),
        pickupScheduledAt: hours(-31),
        pickupCompletedAt: null
      }
    ]
  });

  await tx.pickupProof.create({
    data: {
      id: currentIds.proofs.beets,
      orderId: currentIds.orders.beets,
      type: "PHOTO",
      url: "https://cdn.bioloop.dev/proofs/beets-01.jpg"
    }
  });

  await tx.dispute.createMany({
    data: [
      {
        id: currentIds.disputes.beets,
        orderId: currentIds.orders.beets,
        status: "RESOLVED",
        reason: "QUALITY_ISSUE",
        openedAt: days(-2),
        resolvedAt: days(-1.5),
        openedByUserId: currentIds.users.sellerAdmin,
        resolvedByUserId: currentIds.users.platformAdmin
      },
      {
        id: currentIds.disputes.roots,
        orderId: currentIds.orders.roots,
        status: "OPEN",
        reason: "NO_SHOW",
        openedAt: hours(-25),
        resolvedAt: null,
        openedByUserId: currentIds.users.platformAdmin,
        resolvedByUserId: null
      }
    ]
  });

  await tx.disputeResolution.create({
    data: {
      id: currentIds.resolutions.beets,
      disputeId: currentIds.disputes.beets,
      decision: "SETTLE",
      note: "Resolved with a fee adjustment after quality review.",
      reviewerId: currentIds.users.platformAdmin,
      resolvedAt: days(-1.5)
    }
  });
}

async function seedAuditLogs(tx) {
  await tx.auditLog.createMany({
    data: [
      {
        id: currentIds.auditLogs.grainworksApproval,
        actorUserId: currentIds.users.platformAdmin,
        entityType: "Buyer",
        entityId: currentIds.buyers.grainworks,
        action: "buyer_approval_seeded",
        payload: {
          status: "APPROVED",
          decision: "APPROVE"
        }
      },
      {
        id: currentIds.auditLogs.harborSuspension,
        actorUserId: currentIds.users.platformAdmin,
        entityType: "Buyer",
        entityId: currentIds.buyers.harborFood,
        action: "buyer_approval_seeded",
        payload: {
          status: "SUSPENDED",
          decision: "SUSPEND"
        }
      },
      {
        id: currentIds.auditLogs.beetsResolution,
        actorUserId: currentIds.users.platformAdmin,
        entityType: "Dispute",
        entityId: currentIds.disputes.beets,
        action: "dispute_resolution_seeded",
        payload: {
          decision: "SETTLE"
        }
      }
    ]
  });
}

async function seedBilling(tx) {
  await tx.invoice.create({
    data: {
      id: currentIds.invoices.beets,
      orderId: currentIds.orders.beets,
      sellerId: currentIds.stores.uppsalaNorth,
      buyerId: currentIds.buyers.freshmart,
      currency: "SEK",
      status: "READY",
      billedWeightKg: decimal("548.000"),
      subtotalSek: decimal("3890.80"),
      feeTotalSek: decimal("386.26"),
      totalSek: decimal("3504.54"),
      issuedAt: days(-1.75),
      exportedAt: null,
      lineItems: [
        {
          id: "line_order-beets-01_commodity",
          label: `Lot ${currentIds.stores.uppsalaNorth}`,
          quantityKg: 548,
          unitPriceSekPerKg: 7.1,
          amountSek: 3890.8
        }
      ]
    }
  });

  await tx.invoiceFee.createMany({
    data: [
      {
        id: currentIds.invoiceFees.beetsPlatform,
        invoiceId: currentIds.invoices.beets,
        type: "PLATFORM_PERCENT",
        label: "Platform fee (8%)",
        amountSek: decimal("311.26")
      },
      {
        id: currentIds.invoiceFees.beetsPickup,
        invoiceId: currentIds.invoices.beets,
        type: "PICKUP_FLAT",
        label: "Pickup fee",
        amountSek: decimal("25.00")
      },
      {
        id: currentIds.invoiceFees.beetsDispute,
        invoiceId: currentIds.invoices.beets,
        type: "DISPUTE_FLAT",
        label: "Dispute handling fee",
        amountSek: decimal("50.00")
      }
    ]
  });
}

async function main() {
  await prisma.$transaction(async (tx) => {
    await clearManagedScenario(tx);
    await seedUsers(tx);
    await seedStores(tx);
    await seedCategories(tx);
    await seedBuyers(tx);
    await seedLotsAndAuctions(tx);
    await seedBids(tx);
    await seedOrdersAndDisputes(tx);
    await seedBilling(tx);
    await seedAuditLogs(tx);
  });

  console.log(
    "Seed completed: managed scenario catalog loaded for buyer live feed, seller billing, and admin dispute flows."
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
