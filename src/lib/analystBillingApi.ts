import { apiFetch, parseErrorResponse } from './http';

export type AnalystBillingExtra = {
  id: string;
  userId: string;
  label: string;
  description: string | null;
  category: string;
  amountCop: number;
  active: boolean;
};

export async function createAnalystBillingExtra(
  userId: string,
  payload: {
    label: string;
    amountCop: number;
    description?: string;
    category?: string;
  },
): Promise<AnalystBillingExtra> {
  const res = await apiFetch(`/api/v1/analyst/billing/users/${encodeURIComponent(userId)}/extras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const body = (await res.json()) as { extra: AnalystBillingExtra };
  return body.extra;
}
