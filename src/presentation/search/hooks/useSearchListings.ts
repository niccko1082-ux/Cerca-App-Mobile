import { useInfiniteQuery } from '@tanstack/react-query';

import { SearchListingsUseCase } from '@/application/listing/SearchListingsUseCase';
import { API_BASE_URL } from '@/constants/api';
import { SearchFilters } from '@/domain/listing/Listing';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys, snapToGrid } from '@/presentation/search/listingKeys';
import { Coords } from '@/presentation/search/hooks/useSearchLocation';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const searchListingsUseCase = new SearchListingsUseCase(listingRepository);

type QueryFilters = Omit<SearchFilters, 'lat' | 'lng'>;

export function useSearchListings(filters: QueryFilters, coords: Coords | null) {
  // snapToGrid ANTES de la clave: mover el mapa un poco no debe invalidar la caché.
  const snapped = coords ? snapToGrid(coords) : null;
  const effectiveFilters: SearchFilters = {
    ...filters,
    lat: snapped?.lat,
    lng: snapped?.lng,
  };

  return useInfiniteQuery({
    queryKey: listingKeys.search(effectiveFilters),
    queryFn: ({ pageParam }) => searchListingsUseCase.execute(effectiveFilters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: coords !== null,
  });
}
