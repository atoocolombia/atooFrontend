import { useEffect, useState } from 'react';
import { applyLandingVehicleDefaults, catalogVehicles, type CatalogVehicle } from '../app/data/vehicles';
import { fetchLandingVehicles } from './landingApi';

export function useLandingVehicles() {
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>(() =>
    catalogVehicles.map(applyLandingVehicleDefaults),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLandingVehicles()
      .then((items) => {
        if (!cancelled && items.length > 0) {
          setVehicles(items.map(applyLandingVehicleDefaults));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { vehicles, loading };
}
