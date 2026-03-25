import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import {
  BUYER_APPROVAL_DECISIONS,
  BUYER_APPROVAL_REASONS,
  BUYER_APPROVAL_STATUSES,
  CATALOG_SCOPES,
  DISPUTE_RESOLUTION_DECISIONS,
  DISPUTE_REASONS,
  DISPUTE_STATUSES,
  type ListBuyersQuery,
  type DisputeStatus
} from "./admin.types";
import {
  normalizeApproveBuyerInput,
  normalizeListBuyersQuery,
  normalizeListDisputesQuery,
  normalizeResolveDisputeInput,
  normalizeIngestRealDataInput
} from "./admin.validators";
import { AdminService } from "./admin.service";
import { ADMIN_ROLES, Roles } from "../auth/roles.decorator";
import { getMutationContextFromRequest } from "../mutations/mutation-context";

@Controller("admin")
@ApiTags("admin")
@Roles(...ADMIN_ROLES)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("buyers")
  @ApiOperation({ summary: "List buyers for admin review" })
  @ApiQuery({ name: "status", required: false, enum: [...BUYER_APPROVAL_STATUSES] })
  @ApiQuery({ name: "catalogScope", required: false, enum: [...CATALOG_SCOPES] })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiOkResponse({
    description: "Buyer list",
    schema: {
      type: "object",
      properties: {
        buyers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              buyerId: { type: "string" },
              name: { type: "string" },
              status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] },
              reputationScore: { type: "number" },
              riskLabel: { type: "string" },
              notes: { type: "string" },
              catalog: {
                type: "object",
                properties: {
                  scope: { type: "string", enum: ["demo", "real"] },
                  dataset: { type: "string" },
                  source: { type: "string" },
                  visibleByDefault: { type: "boolean" }
                },
                required: ["scope", "dataset", "source", "visibleByDefault"]
              },
              approval: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "string" },
                  buyerId: { type: "string" },
                  status: { type: "string" },
                  decision: { type: "string", nullable: true },
                  reason: { type: "string", nullable: true },
                  reviewerId: { type: "string", nullable: true },
                  reviewedAt: { type: "string", format: "date-time", nullable: true },
                  notes: { type: "string", nullable: true },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" }
                }
              },
              updatedAt: { type: "string", format: "date-time" }
            },
            required: ["id", "buyerId", "name", "status", "reputationScore", "riskLabel", "notes", "catalog", "approval", "updatedAt"]
          }
        },
        pagination: {
          type: "object",
          properties: {
            limit: { type: "integer" },
            offset: { type: "integer" },
            total: { type: "integer" },
            hasMore: { type: "boolean" }
          },
          required: ["limit", "offset", "total", "hasMore"]
        }
      },
      required: ["buyers", "pagination"]
    }
  })
  async listBuyers(@Query() query: ListBuyersQuery) {
    const parsed = normalizeListBuyersQuery(query);
    return this.adminService.listBuyers(parsed);
  }

  @Post("buyers/:buyerId/approve")
  @ApiOperation({ summary: "Approve, reject, suspend, or reinstate a buyer" })
  @ApiParam({ name: "buyerId", type: "string" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        decision: { type: "string", enum: [...BUYER_APPROVAL_DECISIONS] },
        reason: { type: "string", enum: [...BUYER_APPROVAL_REASONS] },
        reviewerId: { type: "string" },
        notes: { type: "string" }
      },
      required: ["decision", "reason", "reviewerId"]
    }
  })
  @ApiOkResponse({
    description: "Buyer approval recorded",
    schema: {
      type: "object",
      properties: {
        approval: {
          type: "object",
          properties: {
            id: { type: "string" },
            buyerId: { type: "string" },
            status: { type: "string" },
            decision: { type: "string", nullable: true },
            reason: { type: "string", nullable: true },
            reviewerId: { type: "string", nullable: true },
            reviewedAt: { type: "string", format: "date-time", nullable: true },
            notes: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          },
          required: ["id", "buyerId", "status", "decision", "reason", "reviewerId", "reviewedAt", "notes", "createdAt", "updatedAt"]
        }
      },
      required: ["approval"]
    }
  })
  @ApiBadRequestResponse({ description: "Validation error", schema: { type: "object" } })
  async approveBuyer(@Param("buyerId") buyerId: string, @Body() body: unknown, @Req() req: any) {
    const parsed = normalizeApproveBuyerInput(body);
    return this.adminService.approveBuyer(buyerId, parsed, getMutationContextFromRequest(req));
  }

  @Get("disputes")
  @ApiOperation({ summary: "List disputes" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: [...DISPUTE_STATUSES]
  })
  @ApiQuery({
    name: "reason",
    required: false,
    enum: [...DISPUTE_REASONS]
  })
  @ApiQuery({ name: "catalogScope", required: false, enum: [...CATALOG_SCOPES] })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiOkResponse({
    description: "Dispute list",
    schema: {
      type: "object",
      properties: {
        disputes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              orderId: { type: "string" },
              reason: { type: "string", enum: ["NO_SHOW", "QUALITY_ISSUE"] },
              status: { type: "string", enum: ["OPEN", "RESOLVED", "CANCELLED"] },
              openedAt: { type: "string", format: "date-time" },
              resolvedAt: { type: "string", format: "date-time", nullable: true },
              catalog: {
                type: "object",
                properties: {
                  scope: { type: "string", enum: ["demo", "real"] },
                  dataset: { type: "string" },
                  source: { type: "string" },
                  visibleByDefault: { type: "boolean" }
                },
                required: ["scope", "dataset", "source", "visibleByDefault"]
              }
            },
            required: ["id", "orderId", "reason", "status", "openedAt", "resolvedAt", "catalog"]
          }
        },
        pagination: {
          type: "object",
          properties: {
            limit: { type: "integer" },
            offset: { type: "integer" },
            total: { type: "integer" },
            hasMore: { type: "boolean" }
          },
          required: ["limit", "offset", "total", "hasMore"]
        }
      },
      required: ["disputes", "pagination"]
    }
  })
  @ApiBadRequestResponse({ description: "Validation error", schema: { type: "object" } })
  async listDisputes(
    @Query() query: { status?: DisputeStatus; reason?: string; catalogScope?: string; limit?: number; offset?: number }
  ) {
    const parsed = normalizeListDisputesQuery(query);
    return this.adminService.listDisputes(parsed);
  }

  @Post("disputes/:disputeId/resolve")
  @ApiOperation({ summary: "Resolve a dispute" })
  @ApiParam({ name: "disputeId", type: "string" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        decision: { type: "string", enum: [...DISPUTE_RESOLUTION_DECISIONS] },
        reviewerId: { type: "string" },
        note: { type: "string" }
      },
      required: ["decision", "reviewerId"]
    }
  })
  @ApiOkResponse({
    description: "Dispute resolved",
    schema: {
      type: "object",
      properties: {
        dispute: {
          type: "object",
          properties: {
            id: { type: "string" },
            orderId: { type: "string" },
            reason: { type: "string" },
            status: { type: "string" },
            openedAt: { type: "string", format: "date-time" },
            resolvedAt: { type: "string", format: "date-time", nullable: true }
          },
          required: ["id", "orderId", "reason", "status", "openedAt", "resolvedAt"]
        }
      },
      required: ["dispute"]
    }
  })
  @ApiBadRequestResponse({ description: "Validation error", schema: { type: "object" } })
  async resolveDispute(@Param("disputeId") disputeId: string, @Body() body: unknown, @Req() req: any) {
    const parsed = normalizeResolveDisputeInput(body);
    return this.adminService.resolveDispute(disputeId, parsed, getMutationContextFromRequest(req));
  }

  @Post("ingest/real-data")
  @ApiOperation({ summary: "Ingest real data from the Sweden Supermarkets dataset" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        apply: { type: "boolean", default: false, description: "If true, persists data. Otherwise dry-run." }
      }
    }
  })
  @ApiOkResponse({
    description: "Ingest results",
    schema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["dry-run", "apply"] },
        dataset: { type: "string" },
        source: { type: "string" },
        stores: { type: "number" },
        categories: { type: "number" },
        buyers: { type: "number" },
        lots: { type: "number" },
        staleRemoved: {
          type: "object",
          nullable: true,
          properties: {
            stores: { type: "number" },
            categories: { type: "number" },
            buyers: { type: "number" },
            lots: { type: "number" }
          }
        }
      }
    }
  })
  async ingestRealData(@Body() body: unknown, @Req() req: any) {
    const parsed = normalizeIngestRealDataInput(body);
    return this.adminService.ingestRealData(parsed, getMutationContextFromRequest(req));
  }
}
