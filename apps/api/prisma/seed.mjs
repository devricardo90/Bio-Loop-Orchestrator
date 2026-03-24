import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ids = {
  users: {
    platformAdmin: "user_platform_admin",
    sellerAdmin: "user_seller_admin"
  },
  store: "store_norrmalm",
  categories: {
    carrots: "category_carrots",
    greens: "category_greens",
    beets: "category_beets"
  },
  buyers: {
    grainworks: "buyer_grainworks",
    freshmart: "buyer_freshmart",
    harvestCo: "buyer_harvest_co"
  },
  approvals: {
    grainworks: "approval_grainworks",
    freshmart: "approval_freshmart",
    harvestCo: "approval_harvest_co"
  },
  lots: {
    carrots: "lot_carrots_settled",
    greens: "lot_greens_live",
    beets: "lot_beets_noshow"
  },
  auctions: {
    carrots: "auction_carrots_settled",
    greens: "auction_greens_live",
    beets: "auction_beets_noshow"
  },
  bids: {
    carrotsLead: "bid_carrots_lead",
    carrotsClose: "bid_carrots_close",
    greensEarly: "bid_greens_early",
    greensLead: "bid_greens_lead",
    beetsLead: "bid_beets_lead"
  },
  orders: {
    settled: "order_carrots_settled",
    noShow: "order_beets_noshow"
  },
  proofs: {
    settled: "proof_carrots_settled"
  },
  disputes: {
    settled: "dispute_carrots_quality",
    noShow: "dispute_beets_noshow"
  },
  resolutions: {
    settled: "resolution_carrots_quality"
  },
  auditLogs: {
    approval: "audit_buyer_approval",
    dispute: "audit_dispute_resolution"
  }
};

const now = new Date();
const days = (offset) => {
  const value = new Date(now);
  value.setDate(value.getDate() + offset);
  return value;
};

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany();
    await tx.disputeResolution.deleteMany();
    await tx.buyerApproval.deleteMany();
    await tx.pickupProof.deleteMany();
    await tx.dispute.deleteMany();
    await tx.order.deleteMany();
    await tx.bid.deleteMany();
    await tx.auction.deleteMany();
    await tx.lot.deleteMany();
    await tx.buyer.deleteMany();
    await tx.commodityCategory.deleteMany();
    await tx.store.deleteMany();
    await tx.user.deleteMany();

    await tx.user.createMany({
      data: [
        {
          id: ids.users.platformAdmin,
          email: "platform.admin@bio-loop.local",
          name: "Platform Admin",
          role: "PLATFORM_ADMIN"
        },
        {
          id: ids.users.sellerAdmin,
          email: "seller.admin@bio-loop.local",
          name: "Seller Admin",
          role: "SELLER_ADMIN"
        }
      ]
    });

    await tx.store.create({
      data: {
        id: ids.store,
        name: "Norrmalm Market Hub",
        address: "Birger Jarlsgatan 10, Stockholm",
        timezone: "Europe/Stockholm",
        contacts: {
          phone: "+46-8-555-0100",
          email: "ops@norrmalm-market.local"
        },
        pickupWindows: {
          standard: {
            start: "06:00",
            end: "09:00"
          }
        }
      }
    });

    await tx.commodityCategory.createMany({
      data: [
        {
          id: ids.categories.carrots,
          name: "Carrots",
          storageCondition: "COLD",
          rulesDefault: {
            minWeightKg: 120,
            maxDaysToPickup: 3,
            notes: "Root vegetable export mix with tight pickup window"
          }
        },
        {
          id: ids.categories.greens,
          name: "Leafy Greens",
          storageCondition: "COLD",
          rulesDefault: {
            minWeightKg: 80,
            maxDaysToPickup: 2,
            notes: "Fast-moving grocery-grade lots"
          }
        },
        {
          id: ids.categories.beets,
          name: "Beets",
          storageCondition: "DRY",
          rulesDefault: {
            minWeightKg: 150,
            maxDaysToPickup: 4,
            notes: "Used for no-show and dispute scenarios"
          }
        }
      ]
    });

    await tx.buyer.createMany({
      data: [
        {
          id: ids.buyers.grainworks,
          name: "GrainWorks AB",
          approved: true,
          radiusKmDefault: 120,
          reputation: 88
        },
        {
          id: ids.buyers.freshmart,
          name: "FreshMart Logistics",
          approved: false,
          radiusKmDefault: 90,
          reputation: 74
        },
        {
          id: ids.buyers.harvestCo,
          name: "HarvestCo Distribution",
          approved: false,
          radiusKmDefault: 60,
          reputation: 42
        }
      ]
    });

    await tx.buyerApproval.createMany({
      data: [
        {
          id: ids.approvals.grainworks,
          buyerId: ids.buyers.grainworks,
          status: "APPROVED",
          decision: "APPROVE",
          reason: "AUTO_APPROVAL",
          reviewerId: ids.users.platformAdmin,
          reviewedAt: days(-10),
          notes: "High-reputation buyer approved for the demo environment"
        },
        {
          id: ids.approvals.freshmart,
          buyerId: ids.buyers.freshmart,
          status: "PENDING",
          decision: null,
          reason: null,
          reviewerId: null,
          reviewedAt: null,
          notes: "Awaiting manual review"
        },
        {
          id: ids.approvals.harvestCo,
          buyerId: ids.buyers.harvestCo,
          status: "SUSPENDED",
          decision: "SUSPEND",
          reason: "PAYMENT_RISK",
          reviewerId: ids.users.platformAdmin,
          reviewedAt: days(-4),
          notes: "Payment risk review pending remediation"
        }
      ]
    });

    await tx.lot.createMany({
      data: [
        {
          id: ids.lots.carrots,
          storeId: ids.store,
          categoryId: ids.categories.carrots,
          storageCondition: "COLD",
          pickupWindowStartAt: days(-2),
          pickupWindowEndAt: days(-1),
          estimatedWeightKg: new Prisma.Decimal("540.000"),
          finalWeightKg: new Prisma.Decimal("548.000"),
          grade: "A",
          status: "COMPLETED"
        },
        {
          id: ids.lots.greens,
          storeId: ids.store,
          categoryId: ids.categories.greens,
          storageCondition: "COLD",
          pickupWindowStartAt: days(1),
          pickupWindowEndAt: days(2),
          estimatedWeightKg: new Prisma.Decimal("240.000"),
          finalWeightKg: null,
          grade: "B",
          status: "LISTED"
        },
        {
          id: ids.lots.beets,
          storeId: ids.store,
          categoryId: ids.categories.beets,
          storageCondition: "DRY",
          pickupWindowStartAt: days(-3),
          pickupWindowEndAt: days(-2),
          estimatedWeightKg: new Prisma.Decimal("180.000"),
          finalWeightKg: null,
          grade: "C",
          status: "PICKUP_SCHEDULED"
        }
      ]
    });

    await tx.auction.createMany({
      data: [
        {
          id: ids.auctions.carrots,
          lotId: ids.lots.carrots,
          startAt: days(-5),
          endAt: days(-4),
          reservePriceSekPerKg: new Prisma.Decimal("6.50"),
          status: "ENDED",
          highestBidId: null
        },
        {
          id: ids.auctions.greens,
          lotId: ids.lots.greens,
          startAt: days(-1),
          endAt: days(2),
          reservePriceSekPerKg: new Prisma.Decimal("5.25"),
          status: "LIVE",
          highestBidId: null
        },
        {
          id: ids.auctions.beets,
          lotId: ids.lots.beets,
          startAt: days(-6),
          endAt: days(-5),
          reservePriceSekPerKg: new Prisma.Decimal("4.20"),
          status: "ENDED",
          highestBidId: null
        }
      ]
    });

    await tx.bid.createMany({
      data: [
        {
          id: ids.bids.carrotsLead,
          auctionId: ids.auctions.carrots,
          buyerId: ids.buyers.grainworks,
          priceSekPerKg: new Prisma.Decimal("6.80"),
          createdAt: days(-5)
        },
        {
          id: ids.bids.carrotsClose,
          auctionId: ids.auctions.carrots,
          buyerId: ids.buyers.freshmart,
          priceSekPerKg: new Prisma.Decimal("7.10"),
          createdAt: days(-4)
        },
        {
          id: ids.bids.greensEarly,
          auctionId: ids.auctions.greens,
          buyerId: ids.buyers.freshmart,
          priceSekPerKg: new Prisma.Decimal("5.40"),
          createdAt: days(-1)
        },
        {
          id: ids.bids.greensLead,
          auctionId: ids.auctions.greens,
          buyerId: ids.buyers.grainworks,
          priceSekPerKg: new Prisma.Decimal("5.90"),
          createdAt: now
        },
        {
          id: ids.bids.beetsLead,
          auctionId: ids.auctions.beets,
          buyerId: ids.buyers.harvestCo,
          priceSekPerKg: new Prisma.Decimal("4.50"),
          createdAt: days(-6)
        }
      ]
    });

    await tx.auction.update({
      where: { id: ids.auctions.carrots },
      data: { highestBidId: ids.bids.carrotsClose }
    });
    await tx.auction.update({
      where: { id: ids.auctions.greens },
      data: { highestBidId: ids.bids.greensLead }
    });
    await tx.auction.update({
      where: { id: ids.auctions.beets },
      data: { highestBidId: ids.bids.beetsLead }
    });

    await tx.order.createMany({
      data: [
        {
          id: ids.orders.settled,
          lotId: ids.lots.carrots,
          buyerId: ids.buyers.freshmart,
          finalPriceSekPerKg: new Prisma.Decimal("7.10"),
          status: "SETTLED",
          pickupStatus: "COMPLETED",
          pickupWindowStartAt: days(-2),
          pickupWindowEndAt: days(-1),
          pickupScheduledAt: days(-2),
          pickupCompletedAt: days(-1)
        },
        {
          id: ids.orders.noShow,
          lotId: ids.lots.beets,
          buyerId: ids.buyers.harvestCo,
          finalPriceSekPerKg: new Prisma.Decimal("4.50"),
          status: "IN_DISPUTE",
          pickupStatus: "NO_SHOW",
          pickupWindowStartAt: days(-3),
          pickupWindowEndAt: days(-2),
          pickupScheduledAt: days(-3),
          pickupCompletedAt: null
        }
      ]
    });

    await tx.pickupProof.create({
      data: {
        id: ids.proofs.settled,
        orderId: ids.orders.settled,
        type: "PHOTO",
        url: "https://cdn.bio-loop.local/proofs/carrot-settlement-photo.jpg"
      }
    });

    await tx.dispute.createMany({
      data: [
        {
          id: ids.disputes.settled,
          orderId: ids.orders.settled,
          status: "RESOLVED",
          reason: "QUALITY_ISSUE",
          openedAt: days(-2),
          resolvedAt: days(-1),
          openedByUserId: ids.users.sellerAdmin,
          resolvedByUserId: ids.users.platformAdmin
        },
        {
          id: ids.disputes.noShow,
          orderId: ids.orders.noShow,
          status: "OPEN",
          reason: "NO_SHOW",
          openedAt: days(-2),
          resolvedAt: null,
          openedByUserId: ids.users.platformAdmin,
          resolvedByUserId: null
        }
      ]
    });

    await tx.disputeResolution.create({
      data: {
        id: ids.resolutions.settled,
        disputeId: ids.disputes.settled,
        decision: "SETTLE",
        note: "Resolved with a fee adjustment for the settled order.",
        reviewerId: ids.users.platformAdmin,
        resolvedAt: days(-1)
      }
    });

    await tx.auditLog.createMany({
      data: [
        {
          id: ids.auditLogs.approval,
          actorUserId: ids.users.platformAdmin,
          entityType: "Buyer",
          entityId: ids.buyers.grainworks,
          action: "buyer_approval_seeded",
          payload: {
            status: "APPROVED",
            decision: "APPROVE"
          }
        },
        {
          id: ids.auditLogs.dispute,
          actorUserId: ids.users.platformAdmin,
          entityType: "Dispute",
          entityId: ids.disputes.settled,
          action: "dispute_resolution_seeded",
          payload: {
            decision: "SETTLE"
          }
        }
      ]
    });
  });

  console.log("Seed completed: buyers, lots, auctions, orders, disputes, and billing-ready data loaded.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
