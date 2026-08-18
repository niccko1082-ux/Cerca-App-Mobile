import { SearchFilters } from '@/domain/listing/Listing';
import { Coords } from '@/presentation/search/hooks/useSearchLocation';

// Cerca.md: redondear las coordenadas ANTES de la clave de caché — sin esto,
// una clave nueva por cada píxel que se mueve el mapa.
// 19.432608, -99.133209  →  clave A
// 19.432611, -99.133210  →  clave B  (sin snapToGrid, una entrada por micromovimiento)
export const snapToGrid = (c: Coords): Coords => ({
  lat: Math.round(c.lat * 100) / 100, // ~1 km
  lng: Math.round(c.lng * 100) / 100,
});

export const listingKeys = {
  all: ['listings'] as const,
  categories: () => [...listingKeys.all, 'categories'] as const,
  searches: () => [...listingKeys.all, 'search'] as const,
  search: (f: SearchFilters) => [...listingKeys.searches(), f] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
  reviews: (id: string) => [...listingKeys.detail(id), 'reviews'] as const,
  mine: () => [...listingKeys.all, 'mine'] as const,
} as const;
