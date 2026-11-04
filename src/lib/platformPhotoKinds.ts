export const PLATFORM_UI_SLOTS = [1, 2, 3] as const;
export type PlatformUiSlot = (typeof PLATFORM_UI_SLOTS)[number];

export function platformPhotoKindsForSlot(slot: PlatformUiSlot): string[] {
  const kinds = [`platformWork${slot}`];
  for (let i = 2; i <= 4; i++) {
    kinds.push(`platformWork${slot}Photo${i}`);
  }
  return kinds;
}

export const ALL_PLATFORM_PHOTO_KINDS = PLATFORM_UI_SLOTS.flatMap(platformPhotoKindsForSlot);

export function isPlatformPhotoKind(kind: string): boolean {
  return ALL_PLATFORM_PHOTO_KINDS.includes(kind);
}
