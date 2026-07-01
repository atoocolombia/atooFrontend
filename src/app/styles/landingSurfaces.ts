/** Paleta marca (cobalto, estilo editorial tipo Saratoga × Pantone). */
export const landingBrand = {
  blue: '#1A1FE8',
  blueDeep: '#1217C8',
  blueTint: '#EEF1FF',
  navy: '#0B0D2E',
} as const;

/** Fondos alternados de la landing en modo claro: bloques blanco ↔ azul sólido. */
export const landingLightSurfaces = {
  page: 'bg-white',
  benefits: 'bg-white',
  howItWorks: 'bg-[#1A1FE8]',
  vehicles: 'bg-[#EEF1FF]',
  cta: 'bg-[#1217C8]',
  footer: 'bg-[#0B0D2E]',
} as const;

/** Tipografía editorial para modo claro. */
export const landingLightType = {
  eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.22em]',
  eyebrowOnWhite: 'text-[#1A1FE8]',
  eyebrowOnBlue: 'text-white/70',
  titleOnWhite: 'text-gray-900',
  titleOnBlue: 'text-white',
  bodyOnWhite: 'text-gray-600',
  bodyOnBlue: 'text-white/85',
} as const;
