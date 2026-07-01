import { landingLightType } from '../../styles/landingSurfaces';

interface LandingEyebrowProps {
  children: string;
  onBrandBlock?: boolean;
}

export function LandingEyebrow({ children, onBrandBlock = false }: LandingEyebrowProps) {
  return (
    <p
      className={`${landingLightType.eyebrow} mb-5 ${
        onBrandBlock ? landingLightType.eyebrowOnBlue : landingLightType.eyebrowOnWhite
      }`}
    >
      {children}
    </p>
  );
}
