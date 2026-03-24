import { schedulePickupResponseSchema } from "@bio-loop/domain";
import type { PickupWindow, SchedulePickupResponse } from "@bio-loop/domain";

const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

type PickupProofResponse = {
  order: SchedulePickupResponse["order"];
  proof?: {
    id: string;
    orderId: string;
    type: string;
    url: string;
    createdAt: string;
  };
  dispute?: {
    id: string;
    orderId: string;
    reason: string;
    status: string;
    openedAt: string;
    resolvedAt: string | null;
  };
};

export async function schedulePickupToApi(input: {
  orderId: string;
  pickupWindow: PickupWindow;
}): Promise<SchedulePickupResponse> {
  const response = await fetch(`${apiBaseUrl}/buyer/orders/${input.orderId}/schedule-pickup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Schedule pickup request failed with ${response.status}`);
  }

  return schedulePickupResponseSchema.parse((await response.json()) as unknown);
}

export async function submitPodToApi(input: {
  orderId: string;
  type: string;
  url: string;
}): Promise<PickupProofResponse> {
  const response = await fetch(`${apiBaseUrl}/buyer/orders/${input.orderId}/pod`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `POD request failed with ${response.status}`);
  }

  return (await response.json()) as PickupProofResponse;
}
