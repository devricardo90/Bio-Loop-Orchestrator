import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { BUYER_ROLES, Roles } from "../auth/roles.decorator";
import { normalizePlaceBidInput } from "./trades.validators";
import { TradesService } from "./trades.service";

@Controller("buyer/auctions")
@ApiTags("trade")
@Roles(...BUYER_ROLES)
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get("/feed")
  @ApiOperation({ summary: "List buyer feed records backed by the live API" })
  @ApiOkResponse({
    description: "Buyer feed loaded",
    schema: {
      type: "object",
      properties: {
        buyers: { type: "array", items: { type: "object" } },
        activeBuyerId: { type: "string" },
        auctions: { type: "array", items: { type: "object" } },
        lastSyncedAt: { type: "string", format: "date-time" },
        source: { type: "string", enum: ["api"] }
      },
      required: ["buyers", "activeBuyerId", "auctions", "lastSyncedAt", "source"]
    }
  })
  async feed() {
    return this.tradesService.listBuyerFeed();
  }

  @Get(":auctionId")
  @ApiOperation({ summary: "Load one buyer auction detail backed by the live API" })
  @ApiParam({ name: "auctionId", type: "string" })
  @ApiOkResponse({
    description: "Buyer auction detail loaded",
    schema: {
      type: "object",
      properties: {
        buyers: { type: "array", items: { type: "object" } },
        activeBuyerId: { type: "string" },
        auction: { type: "object" },
        relatedAuctions: { type: "array", items: { type: "object" } },
        lastSyncedAt: { type: "string", format: "date-time" },
        source: { type: "string", enum: ["api"] }
      },
      required: ["buyers", "activeBuyerId", "auction", "relatedAuctions", "lastSyncedAt", "source"]
    }
  })
  async detail(@Param("auctionId") auctionId: string) {
    return this.tradesService.getBuyerAuctionDetail(auctionId);
  }

  @Post(":auctionId/bids")
  @ApiOperation({ summary: "Place a bid on a live auction" })
  @ApiParam({ name: "auctionId", type: "string" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        auctionId: { type: "string" },
        buyerId: { type: "string" },
        priceSekPerKg: { type: "number" }
      },
      required: ["auctionId", "buyerId", "priceSekPerKg"]
    }
  })
  @ApiOkResponse({
    description: "Bid accepted",
    schema: {
      type: "object",
      properties: {
        bid: {
          type: "object",
          properties: {
            id: { type: "string" },
            auctionId: { type: "string" },
            buyerId: { type: "string" },
            priceSekPerKg: { type: "number" },
            createdAt: { type: "string", format: "date-time" }
          },
          required: ["id", "auctionId", "buyerId", "priceSekPerKg", "createdAt"]
        }
      },
      required: ["bid"]
    }
  })
  @ApiBadRequestResponse({
    description: "Request validation error or auction mismatch",
    schema: { type: "object" }
  })
  async placeBid(@Param("auctionId") auctionId: string, @Body() body: unknown) {
    const parsed = normalizePlaceBidInput(body);

    if (parsed.auctionId !== auctionId) {
      throw new BadRequestException({
        code: "AUCTION_ID_MISMATCH",
        message: "Auction id in path and body must match",
        details: {
          auctionId,
          bodyAuctionId: parsed.auctionId
        }
      });
    }

    const bid = await this.tradesService.placeBid(parsed);
    return { bid };
  }
}
