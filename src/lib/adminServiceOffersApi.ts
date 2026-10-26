import { ApiError } from './api';
import { apiUrl, fetchWithCreds, parseErrorResponse } from './http';

export type ServiceOfferExtraItem = {
  label: string;
  amountCop: number;
  description?: string;
};

export type AdminServiceOffer = {
  id: string;
  title: string;
  bannerTitle: string;
  bannerSubtitle: string | null;
  detailBody: string;
  extraItems: ServiceOfferExtraItem[];
  deferMonths: number;
  active: boolean;
  decisionsCount: number;
  createdAt: string;
  updatedAt: string;
};

function mapOffer(raw: AdminServiceOffer): AdminServiceOffer {
  const items = Array.isArray(raw.extraItems) ? raw.extraItems : [];
  return {
    ...raw,
    extraItems: items.map((row) => ({
      label: String(row.label ?? ''),
      amountCop: Number(row.amountCop),
      ...(row.description ? { description: String(row.description) } : {}),
    })),
  };
}

export async function adminFetchServiceOffers(): Promise<AdminServiceOffer[]> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/service-offers'), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { offers?: AdminServiceOffer[] };
  return (body.offers ?? []).map(mapOffer);
}

export async function adminCreateServiceOffer(input: {
  title: string;
  bannerTitle: string;
  bannerSubtitle?: string;
  detailBody: string;
  extraItems: ServiceOfferExtraItem[];
  deferMonths: number;
  active?: boolean;
}): Promise<AdminServiceOffer> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/service-offers'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { offer?: AdminServiceOffer };
  if (!body.offer) throw new ApiError('Respuesta inválida', res.status);
  return mapOffer(body.offer);
}

export async function adminUpdateServiceOffer(
  offerId: string,
  input: Partial<{
    active: boolean;
    title: string;
    bannerTitle: string;
    bannerSubtitle: string | null;
    detailBody: string;
    extraItems: ServiceOfferExtraItem[];
    deferMonths: number;
  }>,
): Promise<AdminServiceOffer> {
  const res = await fetchWithCreds(
    apiUrl(`/api/v1/admin/service-offers/${encodeURIComponent(offerId)}`),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { offer?: AdminServiceOffer };
  if (!body.offer) throw new ApiError('Respuesta inválida', res.status);
  return mapOffer(body.offer);
}

export function offerItemsTotalCop(items: ServiceOfferExtraItem[]): number {
  return items.reduce((sum, i) => sum + (Number.isFinite(i.amountCop) ? i.amountCop : 0), 0);
}
