CREATE TABLE "MutationIdempotency" (
  "id" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "actorKey" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "response" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MutationIdempotency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MutationIdempotency_scope_actorKey_key_key"
ON "MutationIdempotency"("scope", "actorKey", "key");

CREATE INDEX "MutationIdempotency_scope_actorKey_createdAt_idx"
ON "MutationIdempotency"("scope", "actorKey", "createdAt");
