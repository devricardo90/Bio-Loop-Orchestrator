export type MutationActor = {
  id: string;
  role?: string;
};

export type MutationContext = {
  actor?: MutationActor | null;
  requestId?: string | null;
  idempotencyKey?: string | null;
  source?: "http" | "job";
};

export function toActorKey(context?: MutationContext | null) {
  return context?.actor?.id ?? "system";
}

export function getMutationContextFromRequest(request: any): MutationContext {
  const header = (name: string) => {
    if (typeof request?.header === "function") {
      return request.header(name);
    }

    const value = request?.headers?.[name];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    actor: request?.user ? { id: request.user.id, role: request.user.role } : null,
    requestId: request?.requestId ?? header("x-request-id") ?? null,
    idempotencyKey: header("idempotency-key") ?? header("x-idempotency-key") ?? null,
    source: "http"
  };
}
