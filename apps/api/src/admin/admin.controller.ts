import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
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

@Controller("admin")
@ApiTags("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  async approveBuyer(@Param("buyerId") buyerId: string, @Body() body: unknown) {
    const parsed = normalizeApproveBuyerInput(body);
    return this.adminService.approveBuyer(buyerId, parsed);
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
  async resolveDispute(@Param("disputeId") disputeId: string, @Body() body: unknown) {
    const parsed = normalizeResolveDisputeInput(body);
    return this.adminService.resolveDispute(disputeId, parsed);
  }
}
