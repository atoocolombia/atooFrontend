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

const IDENTITY_KINDS = [
  'idFront',
  'idBack',
  'licenseFront',
  'licenseBack',
  'selfieWhiteBackground',
] as const;

const RESIDENCE_KINDS = [
  'utilityAddressReceipt',
  'platformWork1',
  'platformWork2',
  'platformWork3',
] as const;

const BANKING_KINDS = ['bankDocument', 'creditReport'] as const;

/** Infiere el paso actual a partir de documentos ya subidos (si no hay progreso guardado). */
export function inferProgressFromDocuments(
  documentKinds: string[],
  step0Completed = false,
): Pick<ApplicationProgress, 'currentStep' | 'step0Completed'> {
  const kinds = new Set(documentKinds);

  if (BANKING_KINDS.some((k) => kinds.has(k))) {
    return { currentStep: 3, step0Completed: true };
  }

  if (RESIDENCE_KINDS.some((k) => kinds.has(k))) {
    return { currentStep: 2, step0Completed: true };
  }

  if (IDENTITY_KINDS.some((k) => kinds.has(k))) {
    return { currentStep: 1, step0Completed: true };
  }

  if (step0Completed || kinds.has('dataTreatmentSigned')) {
    return { currentStep: 1, step0Completed: true };
  }

  return { currentStep: 0, step0Completed: false };
}
