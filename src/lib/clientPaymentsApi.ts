import { useCallback, useEffect, useState } from 'react';
import { fetchAuthMe } from './authApi';
import { getSessionUser } from './authRouting';
import { apiFetch, parseErrorResponse } from './http';
import { formatCop, formatPaymentDate } from './paymentsApi';

export type ClientPortalPaymentItem = {
  id: string;
  amountCop: number;
  paidAt: string;
  paymentMethod: string | null;
  paymentMethodLabel: string;
  kind: 'deposit' | 'weekly' | 'other';
};

export type ClientPaymentSummary = {
  weeklyPaymentCop: number;
  planWeeks: number;
  totalPaidCop: number;
  paymentsCount: number;
  weeksRecognized: number;
  progressPercent: number;
  remainingWeeks: number;
  lastPaidAt: string | null;
  nextPaymentDueAt: string | null;
  paymentStatus: 'current' | 'warning' | 'critical';
  depositPaid: boolean;
  depositPaidAt: string | null;
  depositAmountCop: number | null;
  history: ClientPortalPaymentItem[];
  installmentPlan: boolean;
  installmentsPaid: number;
  planInstallments: number;
  remainingInstallments: number;
};

async function readPaymentSummaryResponse(res: Response): Promise<ClientPaymentSummary> {
  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new Error(message);
  }
  const body = (await res.json().catch(() => ({}))) as {
    summary?: ClientPaymentSummary;
    paymentSummary?: ClientPaymentSummary;
    error?: string;
  };
  if (body.error?.trim()) throw new Error(body.error);
  const summary = body.summary ?? body.paymentSummary;
  if (!summary) throw new Error('Respuesta inválida del servidor');
  return summary;
}

async function fetchPaymentSummaryFromAuthMe(): Promise<ClientPaymentSummary | null> {
  const res = await apiFetch('/api/v1/auth/me?includePayments=1');
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
  const body = (await res.json().catch(() => ({}))) as {
    paymentSummary?: ClientPaymentSummary | null;
    error?: string;
  };
  if (body.error?.trim()) throw new Error(body.error);
  return body.paymentSummary ?? null;
}

async function resolvePaymentsUserId(): Promise<string | undefined> {
  const cached = getSessionUser({ refresh: false })?.id?.trim();
  if (cached) return cached;
  try {
    const me = await fetchAuthMe();
    return me.id;
  } catch {
    return undefined;
  }
}

export async function fetchClientPaymentSummary(userId?: string): Promise<ClientPaymentSummary> {
  try {
    const portalRes = await apiFetch('/api/client-portal-payment-summary', { cache: 'no-store' });
    if (portalRes.status !== 404) {
      return await readPaymentSummaryResponse(portalRes);
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('sesión') || err.message.includes('Sesión')) {
        throw err;
      }
      if (err.message.includes('DATABASE_URL') || err.message.includes('Plataforma:')) {
        throw err;
      }
    }
  }

  try {
    const fromAuthMe = await fetchPaymentSummaryFromAuthMe();
    if (fromAuthMe) return fromAuthMe;
  } catch (err) {
    if (err instanceof Error && (err.message.includes('sesión') || err.message.includes('Sesión'))) {
      throw err;
    }
  }

  const sessionUserId = userId?.trim() || (await resolvePaymentsUserId());
  const candidates: string[] = ['/api/v1/auth/me/payment-summary'];

  if (sessionUserId) {
    candidates.push(`/api/v1/users/${encodeURIComponent(sessionUserId)}/payment-summary`);
  }
  candidates.push('/api/v1/client/payments/summary');

  let lastError: Error | null = null;
  for (const path of candidates) {
    const res = await apiFetch(path);
    if (res.status === 404) {
      lastError = new Error('Ruta de pagos no disponible en el servidor');
      continue;
    }
    try {
      return await readPaymentSummaryResponse(res);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Error al cargar pagos');
      if (res.status === 401 || res.status === 403) {
        throw lastError;
      }
      if (res.status >= 500 || res.status === 503) {
        continue;
      }
      throw lastError;
    }
  }
  throw (
    lastError ??
    new Error('No se pudo cargar tu información de pagos. Intenta cerrar sesión y volver a entrar.')
  );
}

export function formatNextPaymentDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(iso));
}

export function daysUntilDue(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export { formatCop, formatPaymentDate };

export function useClientPaymentSummary() {
  const [summary, setSummary] = useState<ClientPaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientPaymentSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pagos');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, loading, error, reload };
}
