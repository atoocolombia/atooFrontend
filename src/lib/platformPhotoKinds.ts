export const PLATFORM_UI_SLOTS = [1, 2, 3] as const;
export type PlatformUiSlot = (typeof PLATFORM_UI_SLOTS)[number];

export const PLATFORM_MOBILITY_MULTI_APP_PDF = 'platformMobilityMultiAppPdf';

export const MAX_PLATFORM_PHOTO_INDEX_PER_SLOT = 40;

const PLATFORM_PHOTO_KIND = /^platformWork([1-3])(?:Photo(\d+))?$/;
const PLATFORM_VIDEO_KIND = /^platformWork([1-3])Video$/;
const PLATFORM_PDF_KIND = /^platformWork([1-3])Pdf$/;

export function photoKindForSlotIndex(slot: PlatformUiSlot, index: number): string {
  if (index < 1 || index > MAX_PLATFORM_PHOTO_INDEX_PER_SLOT) {
    throw new Error('Índice de captura fuera de rango');
  }
  if (index === 1) return `platformWork${slot}`;
  return `platformWork${slot}Photo${index}`;
}

export function videoKindForSlot(slot: PlatformUiSlot): string {
  return `platformWork${slot}Video`;
}

export function pdfKindForSlot(slot: PlatformUiSlot): string {
  return `platformWork${slot}Pdf`;
}

export function parsePlatformAttachmentKind(
  kind: string,
): { slot: PlatformUiSlot; photoIndex: number; media: 'photo' | 'video' | 'pdf' } | null {
  if (kind === PLATFORM_MOBILITY_MULTI_APP_PDF) return null;

  const video = kind.match(PLATFORM_VIDEO_KIND);
  if (video) {
    return { slot: Number(video[1]) as PlatformUiSlot, photoIndex: 0, media: 'video' };
  }

  const pdf = kind.match(PLATFORM_PDF_KIND);
  if (pdf) {
    return { slot: Number(pdf[1]) as PlatformUiSlot, photoIndex: 0, media: 'pdf' };
  }

  const photo = kind.match(PLATFORM_PHOTO_KIND);
  if (photo) {
    const slot = Number(photo[1]) as PlatformUiSlot;
    const photoIndex = photo[2] ? Number(photo[2]) : 1;
    if (photoIndex < 1 || photoIndex > MAX_PLATFORM_PHOTO_INDEX_PER_SLOT) return null;
    return { slot, photoIndex, media: 'photo' };
  }

  return null;
}

export function isPlatformAttachmentKind(kind: string): boolean {
  if (kind === PLATFORM_MOBILITY_MULTI_APP_PDF) return true;
  if (kind === 'platformWork4') return true;
  if (/^platformWork[1-3]Photo\d+$/.test(kind)) {
    const idx = Number(kind.replace(/^platformWork[1-3]Photo/, ''));
    return idx >= 2 && idx <= MAX_PLATFORM_PHOTO_INDEX_PER_SLOT;
  }
  return parsePlatformAttachmentKind(kind) !== null;
}

/** Índices de capturas foto/PDF ya usados en documentos para una plataforma. */
export function photoIndicesUsedInDocuments(
  documents: Record<string, unknown>,
  slot: PlatformUiSlot,
): number[] {
  const indices = new Set<number>();
  for (const kind of Object.keys(documents)) {
    const parsed = parsePlatformAttachmentKind(kind);
    if (parsed?.slot === slot && parsed.media === 'photo') {
      indices.add(parsed.photoIndex);
    }
  }
  return [...indices].sort((a, b) => a - b);
}

export function maxPhotoIndexInDocuments(
  documents: Record<string, unknown>,
  slot: PlatformUiSlot,
): number {
  const used = photoIndicesUsedInDocuments(documents, slot);
  return used.length > 0 ? Math.max(...used) : 0;
}

export function nextPhotoIndexForSlot(
  documents: Record<string, unknown>,
  slot: PlatformUiSlot,
): number {
  const used = photoIndicesUsedInDocuments(documents, slot);
  for (let i = 1; i <= MAX_PLATFORM_PHOTO_INDEX_PER_SLOT; i++) {
    if (!used.includes(i)) return i;
  }
  return MAX_PLATFORM_PHOTO_INDEX_PER_SLOT;
}

export function isPlatformPhotoKind(kind: string): boolean {
  const parsed = parsePlatformAttachmentKind(kind);
  return parsed?.media === 'photo';
}
