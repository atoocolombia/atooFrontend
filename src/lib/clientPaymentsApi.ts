import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './http';
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

export async function fetchClientPaymentSummary(): Promise<ClientPaymentSummary> {
  const res = await apiFetch('/api/v1/client/payments/summary');
  const body = (await res.json().catch(() => ({}))) as {
    summary?: ClientPaymentSummary;
    error?: string;
  };
  if (!res.ok) throw new Error(body.error ?? 'No se pudo cargar tu información de pagos');
  if (!body.summary) throw new Error('Respuesta inválida del servidor');
  return body.summary;
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
