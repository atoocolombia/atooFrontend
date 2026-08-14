import { shouldShowStagingBanner } from '../../lib/appEnv';

/** Aviso fijo para no confundir pruebas con lo que ven los clientes. */
export function StagingBanner() {
  if (!shouldShowStagingBanner()) return null;

  return (
    <div className="sticky top-0 z-[90] bg-amber-400 text-amber-950 text-center text-sm font-semibold px-3 py-2">
      Ambiente de pruebas — los clientes no ven esto
    </div>
  );
}
