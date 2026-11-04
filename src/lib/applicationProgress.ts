import { isPlatformAttachmentKind } from './platformPhotoKinds';

export interface ApplicationProgress {
  currentStep: number;
  showBackgroundCheck: boolean;
  showFinalMessage: boolean;
  step0Completed: boolean;
}

const STORAGE_PREFIX = 'atooApplicationProgress:';

export const DEFAULT_APPLICATION_PROGRESS: ApplicationProgress = {
  currentStep: 0,
  showBackgroundCheck: false,
  showFinalMessage: false,
  step0Completed: false,
};

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadApplicationProgress(userId: string): ApplicationProgress | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ApplicationProgress>;
    return {
      currentStep: typeof parsed.currentStep === 'number' ? parsed.currentStep : 0,
      showBackgroundCheck: Boolean(parsed.showBackgroundCheck),
      showFinalMessage: Boolean(parsed.showFinalMessage),
      step0Completed: Boolean(parsed.step0Completed),
    };
  } catch {
    return null;
  }
}

export function saveApplicationProgress(userId: string, progress: ApplicationProgress): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(progress));
}

export function clearApplicationProgress(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}

export function isApplicationCompleted(userId: string): boolean {
  return loadApplicationProgress(userId)?.showFinalMessage === true;
}

export function markApplicationCompleted(userId: string): void {
  saveApplicationProgress(userId, {
    currentStep: 3,
    showBackgroundCheck: false,
    showFinalMessage: true,
    step0Completed: true,
  });
}

/** Hay progreso guardado localmente y la solicitud no fue enviada. */
export function hasLocalApplicationInProgress(userId: string): boolean {
  const progress = loadApplicationProgress(userId);
  if (!progress || progress.showFinalMessage) return false;
  return (
    progress.step0Completed ||
    progress.currentStep > 0 ||
    progress.showBackgroundCheck
  );
}

export const IDENTITY_DOCUMENT_KINDS = [
  'idFront',
  'idBack',
  'idBothSides',
  'licenseFront',
  'licenseBack',
  'licenseBothSides',
  'selfieWhiteBackground',
] as const;

export type IdentityDocumentKind = (typeof IDENTITY_DOCUMENT_KINDS)[number];

function isValidated(doc: { validationStatus?: string } | undefined): boolean {
  return doc?.validationStatus === 'VALIDATED';
}

export function isIdentityDocumentComplete(
  documents: Record<string, { validationStatus?: string } | undefined>,
): boolean {
  if (isValidated(documents.idBothSides)) return true;
  return isValidated(documents.idFront) && isValidated(documents.idBack);
}

export function isLicenseDocumentComplete(
  documents: Record<string, { validationStatus?: string } | undefined>,
): boolean {
  if (isValidated(documents.licenseBothSides)) return true;
  return isValidated(documents.licenseFront) && isValidated(documents.licenseBack);
}

/** Paso 3: recibo validado y plataforma 1 completa (varias fotos agregadas en servidor). */
export function isResidenceStepComplete(
  documents: Record<string, { validationStatus?: string } | undefined>,
  workAddressMeta?: { platformSlot1Complete?: boolean } | null,
): boolean {
  return isValidated(documents.utilityAddressReceipt) && workAddressMeta?.platformSlot1Complete === true;
}

/** Paso 2 completo: identidad + licencia + selfie (frente/reverso por separado o en un solo archivo). */
export function isIdentityStepComplete(
  documents: Record<string, { validationStatus?: string } | undefined>,
): boolean {
  return (
    isIdentityDocumentComplete(documents) &&
    isLicenseDocumentComplete(documents) &&
    isValidated(documents.selfieWhiteBackground)
  );
}

function isResidenceDocumentKind(kind: string): boolean {
  return kind === 'utilityAddressReceipt' || isPlatformAttachmentKind(kind);
}

const BANKING_KINDS = ['bankDocument', 'creditReport'] as const;

const IDENTITY_STEP_KINDS = new Set<string>([
  'idFront',
  'idBack',
  'idBothSides',
  'licenseFront',
  'licenseBack',
  'licenseBothSides',
  'selfieWhiteBackground',
]);

/** Infiere el paso actual a partir de documentos ya subidos (si no hay progreso guardado). */
export function inferProgressFromDocuments(
  documentKinds: string[],
  step0Completed = false,
): Pick<ApplicationProgress, 'currentStep' | 'step0Completed'> {
  const kinds = new Set(documentKinds);

  if (BANKING_KINDS.some((k) => kinds.has(k))) {
    return { currentStep: 3, step0Completed: true };
  }

  if ([...kinds].some((k) => isResidenceDocumentKind(k))) {
    return { currentStep: 2, step0Completed: true };
  }

  if ([...kinds].some((k) => IDENTITY_STEP_KINDS.has(k))) {
    return { currentStep: 1, step0Completed: true };
  }

  if (step0Completed) {
    return { currentStep: 1, step0Completed: true };
  }

  return { currentStep: 0, step0Completed: false };
}

export function inferIdUploadMode(
  documents: Record<string, { validationStatus?: string } | undefined>,
): 'separate' | 'combined' {
  if (documents.idBothSides) return 'combined';
  if (documents.idFront || documents.idBack) return 'separate';
  return 'separate';
}

export function inferLicenseUploadMode(
  documents: Record<string, { validationStatus?: string } | undefined>,
): 'separate' | 'combined' {
  if (documents.licenseBothSides) return 'combined';
  if (documents.licenseFront || documents.licenseBack) {
    return 'separate';
  }
  return 'separate';
}
