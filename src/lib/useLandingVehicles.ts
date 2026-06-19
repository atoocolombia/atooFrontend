import { useEffect, useState } from 'react';
import { catalogVehicles, type CatalogVehicle } from '../app/data/vehicles';
import { fetchLandingVehicles } from './landingApi';

export function useLandingVehicles() {
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>(catalogVehicles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLandingVehicles()
      .then((items) => {
        if (!cancelled && items.length > 0) {
          setVehicles(items);
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
