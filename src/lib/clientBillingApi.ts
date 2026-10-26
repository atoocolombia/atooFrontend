import { useCallback, useEffect, useState } from 'react';
import { apiFetch, parseErrorResponse } from './http';
import { formatCop } from './paymentsApi';

export type BillingExtraLine = {
  id: string;
  label: string;
  description: string | null;
  category: string;
  amountCop: number;
};

export type ServiceOfferItem = {
  label: string;
  amountCop: number;
  description?: string;
};

export type PendingServiceOffer = {
  id: string;
  title: string;
  bannerTitle: string;
  bannerSubtitle: string | null;
  detailBody: string;
  extraItems: ServiceOfferItem[];
};

export type ClientBillingStatement = {
  periodLabel: string;
  baseInstallmentCop: number;
  baseInstallmentLabel: string;
  extras: BillingExtraLine[];
  extrasSubtotalCop: number;
  totalDueCop: number;
  nextPaymentDueAt: string | null;
  pendingOffer: PendingServiceOffer | null;
};

export async function fetchClientBillingStatement(): Promise<ClientBillingStatement> {
  const res = await apiFetch('/api/v1/client/billing/statement');
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const body = (await res.json()) as { statement?: ClientBillingStatement };
  if (!body.statement) throw new Error('No se pudo cargar la cuenta de cobro');
  return body.statement;
}

export async function respondToServiceOffer(
  offerId: string,
  accept: boolean,
): Promise<ClientBillingStatement> {
  const res = await apiFetch(`/api/v1/client/billing/offers/${encodeURIComponent(offerId)}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accept }),
  });
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const body = (await res.json()) as { statement?: ClientBillingStatement };
  if (!body.statement) throw new Error('Respuesta inválida del servidor');
  return body.statement;
}

export function useClientBillingStatement(enabled = true) {
  const [statement, setStatement] = useState<ClientBillingStatement | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      setStatement(await fetchClientBillingStatement());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuenta de cobro');
      setStatement(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { statement, loading, error, reload, setStatement };
}

export function categoryLabel(category: string): string {
  if (category === 'insurance') return 'Seguro';
  if (category === 'service') return 'Servicio';
  return 'Otro';
}

export { formatCop };
