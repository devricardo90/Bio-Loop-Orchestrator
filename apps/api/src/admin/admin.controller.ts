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
  DISPUTE_RESOLUTION_DECISIONS,
  DISPUTE_STATUSES,
  type DisputeStatus
} from "./admin.types";
import { normalizeApproveBuyerInput, normalizeListDisputesQuery, normalizeResolveDisputeInput } from "./admin.validators";
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
            required: ["id", "buyerId", "name", "status", "reputationScore", "riskLabel", "notes", "approval", "updatedAt"]
          }
        }
      },
      required: ["buyers"]
    }
  })
  async listBuyers() {
    return this.adminService.listBuyers();
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
              resolvedAt: { type: "string", format: "date-time", nullable: true }
            },
            required: ["id", "orderId", "reason", "status", "openedAt", "resolvedAt"]
          }
        }
      },
      required: ["disputes"]
    }
  })
  @ApiBadRequestResponse({ description: "Validation error", schema: { type: "object" } })
  async listDisputes(@Query() query: { status?: DisputeStatus }) {
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
}
