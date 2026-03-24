import { BadRequestException, Body, Controller, Param, Post } from "@nestjs/common";
import { normalizePlaceBidInput } from "./trades.validators";
import { TradesService } from "./trades.service";

@Controller("buyer/auctions")
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post(":auctionId/bids")
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
