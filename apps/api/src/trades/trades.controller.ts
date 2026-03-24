import { BadRequestException, Body, Controller, Param, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { normalizePlaceBidInput } from "./trades.validators";
import { TradesService } from "./trades.service";

@Controller("buyer/auctions")
@ApiTags("trade")
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

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
