import { useCallback, useEffect, useState } from 'react';
import { apiFetch, parseErrorResponse } from './http';
import { formatCop } from './paymentsApi';

export type WorkshopBillingLine = {
  id: string;
  workshopName: string;
  title: string;
  amountCop: number;
  totalCostCop: number;
  paymentMode: 'single_month' | 'deferred';
  deferMonths: number;
  installmentsTotal: number | null;
  installmentsRemaining: number | null;
  installmentLabel: string | null;
};

export type BillingExtraLine = {
  id: string;
  label: string;
  description: string | null;
  category: string;
  amountCop: number;
  totalServiceCop: number | null;
  deferInstallmentsTotal: number | null;
  deferInstallmentsRemaining: number | null;
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
  deferMonths: number;
};

export type BillingPeriodListItem = {
  year: number;
  month: number;
  label: string;
  totalDueCop: number;
  isCurrent: boolean;
};

export type BillingCollectionStatus =
  | 'paid'
  | 'partial'
  | 'pending'
  | 'due_soon'
  | 'overdue';

export type BillingCollection = {
  status: BillingCollectionStatus;
  paidRegisteredCop: number;
  remainingDueCop: number;
  dueAt: string | null;
  alertTitle: string | null;
  alertMessage: string | null;
};

export type ClientBillingStatement = {
  year: number;
  month: number;
  periodLabel: string;
  isCurrentPeriod: boolean;
  baseInstallmentCop: number;
  baseInstallmentLabel: string;
  extras: BillingExtraLine[];
  extrasSubtotalCop: number;
  workshopCharges: WorkshopBillingLine[];
  workshopSubtotalCop: number;
  totalDueCop: number;
  nextPaymentDueAt: string | null;
  pendingOffer: PendingServiceOffer | null;
  collection: BillingCollection;
};

function currentPeriod(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export async function fetchClientBillingPeriods(): Promise<BillingPeriodListItem[]> {
  const res = await apiFetch('/api/v1/client/billing/periods');
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const body = (await res.json()) as { periods?: BillingPeriodListItem[] };
  return body.periods ?? [];
}

export async function fetchClientBillingStatement(
  year?: number,
  month?: number,
): Promise<ClientBillingStatement> {
  const params = new URLSearchParams();
  if (year != null) params.set('year', String(year));
  if (month != null) params.set('month', String(month));
  const qs = params.toString();
  const res = await apiFetch(`/api/v1/client/billing/statement${qs ? `?${qs}` : ''}`);
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

export function useClientBilling(year: number, month: number, enabled = true) {
  const [statement, setStatement] = useState<ClientBillingStatement | null>(null);
  const [periods, setPeriods] = useState<BillingPeriodListItem[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [stmt, list] = await Promise.all([
        fetchClientBillingStatement(year, month),
        fetchClientBillingPeriods(),
      ]);
      setStatement(stmt);
      setPeriods(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuenta de cobro');
      setStatement(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, year, month]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { statement, periods, loading, error, reload, setStatement };
}

export function useCurrentBillingPeriod() {
  const [year, setYear] = useState(() => currentPeriod().year);
  const [month, setMonth] = useState(() => currentPeriod().month);
  return { year, month, setYear, setMonth };
}

export function categoryLabel(category: string): string {
  if (category === 'insurance') return 'Seguro';
  if (category === 'service') return 'Servicio';
  return 'Otro';
}

export function deferLineHint(line: BillingExtraLine): string | null {
  if (!line.deferInstallmentsTotal || line.deferInstallmentsTotal <= 1) return null;
  const left = line.deferInstallmentsRemaining ?? line.deferInstallmentsTotal;
  const total = line.totalServiceCop;
  return `Cuota ${line.deferInstallmentsTotal - left + 1} de ${line.deferInstallmentsTotal}${
    total ? ` · Total servicio ${formatCop(total)}` : ''
  }`;
}

export function offerDeferSummary(offer: PendingServiceOffer): string {
  const months = Math.max(1, offer.deferMonths);
  if (months <= 1) return 'El cargo se suma completo en tu próxima cuenta de cobro.';
  const total = offer.extraItems.reduce((s, i) => s + i.amountCop, 0);
  const monthly = Math.ceil(total / months);
  return `Puedes diferir el pago en ${months} meses: ${formatCop(monthly)} por mes (total ${formatCop(total)}).`;
}

export { formatCop };
