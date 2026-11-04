import { ApiError } from './api';
import { fetchWithCreds, apiUrl, parseErrorResponse, isApiConfigured } from './http';

export interface UserDocumentMeta {
  id: string;
  documentKind: string;
  validationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED';
  validationMessage: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  signedAt: string | null;
  createdAt: string;
}

export async function listUserDocuments(userId: string): Promise<UserDocumentMeta[]> {
  if (!isApiConfigured()) {
    throw new ApiError(
      'No está configurada la URL del API. Define VITE_API_URL en Vercel o en frontend/.env.',
      0,
    );
  }

  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/documents`);

  let res: Response;
  try {
    res = await fetchWithCreds(url);
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return (await res.json()) as UserDocumentMeta[];
}

export type UploadUserDocumentOptions = {
  /** Paso 3: declaración sí/no conducción de vehículo eléctrico en apps */
  mobilityElectricVehicle?: boolean;
};

export async function uploadUserDocument(
  userId: string,
  documentKind: string,
  file: File,
  options?: UploadUserDocumentOptions,
): Promise<UserDocumentMeta> {
  if (!isApiConfigured()) {
    throw new ApiError(
      'No está configurada la URL del API. Define VITE_API_URL en Vercel o en frontend/.env.',
      0,
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('documentKind', documentKind);
  if (options?.mobilityElectricVehicle !== undefined) {
    form.append('mobilityElectricVehicle', options.mobilityElectricVehicle ? 'true' : 'false');
  }

  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/documents`);

  let res: Response;
  try {
    res = await fetchWithCreds(url, { method: 'POST', body: form });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return (await res.json()) as UserDocumentMeta;
}

export type PlatformSlotMeta = {
  complete: boolean;
  missing: string[];
};

export type WorkAddressStepMeta = {
  mobilityDrivenElectricVehicle: boolean | null;
  mobilityElectricExperienceText: string | null;
  platformSlot1Complete: boolean;
  platformSlot2Complete: boolean;
  platformSlot3Complete: boolean;
  platformSlots: Record<'1' | '2' | '3', PlatformSlotMeta>;
};

export type PatchWorkAddressStepMetaInput = {
  mobilityDrivenElectricVehicle?: boolean;
  mobilityElectricExperienceText?: string | null;
};

export async function fetchWorkAddressStepMeta(userId: string): Promise<WorkAddressStepMeta> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/work-address-step-meta`);
  const res = await fetchWithCreds(url);
  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }
  return (await res.json()) as WorkAddressStepMeta;
}

export async function patchWorkAddressStepMeta(
  userId: string,
  patch: PatchWorkAddressStepMetaInput,
): Promise<WorkAddressStepMeta> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/work-address-step-meta`);
  const res = await fetchWithCreds(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }
  return (await res.json()) as WorkAddressStepMeta;
}

export async function saveMobilityElectricVehicle(userId: string, value: boolean): Promise<WorkAddressStepMeta> {
  return patchWorkAddressStepMeta(userId, { mobilityDrivenElectricVehicle: value });
}
