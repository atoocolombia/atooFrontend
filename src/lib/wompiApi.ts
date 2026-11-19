import { apiFetch } from './http';
import { buildWompiReturnUrl } from './wompiRedirect';

export type WompiWidgetSession = {
  publicKey: string;
  currency: string;
  amountInCents: number;
  amountCop: number;
  reference: string;
  integritySignature: string;
  redirectUrl: string;
  kind: 'deposit' | 'installment';
  customerEmail: string;
  customerFullName: string | null;
};

export async function createWompiWidgetSession(kind: 'deposit' | 'installment'): Promise<WompiWidgetSession> {
  const redirectUrl = buildWompiReturnUrl();
  const res = await apiFetch('/api/v1/client/payments/wompi/widget-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, redirectUrl: redirectUrl || undefined }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo iniciar el pago con Wompi');
  }
  return res.json() as Promise<WompiWidgetSession>;
}