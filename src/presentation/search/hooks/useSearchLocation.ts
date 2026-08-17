import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface Coords {
  lat: number;
  lng: number;
}

interface FallbackCity {
  id: string;
  name: string;
  coords: Coords;
}

// Cerca.md US-08: si niegan la ubicación, ofrecer un selector de ciudad en vez
// de dejar la pantalla en blanco.
export const FALLBACK_CITIES: FallbackCity[] = [
  { id: 'cdmx', name: 'Ciudad de México', coords: { lat: 19.4326, lng: -99.1332 } },
  { id: 'gdl', name: 'Guadalajara', coords: { lat: 20.6597, lng: -103.3496 } },
  { id: 'mty', name: 'Monterrey', coords: { lat: 25.6866, lng: -100.3161 } },
  { id: 'bog', name: 'Bogotá', coords: { lat: 4.711, lng: -74.0721 } },
];

type LocationStatus = 'loading' | 'ready' | 'needs-city';

export function useSearchLocation() {
  const [status, setStatus] = useState<LocationStatus>('loading');
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (permission === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          if (cancelled) return;
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setStatus('ready');
          return;
        }
      } catch {
        // Sigue al selector de ciudad — la app no se queda en blanco.
      }
      if (!cancelled) setStatus('needs-city');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectCity = (cityId: string) => {
    const city = FALLBACK_CITIES.find((c) => c.id === cityId);
    if (!city) return;
    setCoords(city.coords);
    setStatus('ready');
  };

  return { status, coords, selectCity, cities: FALLBACK_CITIES };
}
