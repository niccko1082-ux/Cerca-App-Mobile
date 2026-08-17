import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLocalFavorites,
  toggleLocalFavorite,
} from '@/infrastructure/listing/LocalFavoriteAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

export function useFavoritesQuery() {
  return useQuery({
    queryKey: ['favorites-ids'],
    queryFn: getLocalFavorites,
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLocalFavorite,
    onSuccess: (data) => {
      // Update local query cache
      queryClient.setQueryData(['favorites-ids'], data);

      // Invalidate listing cache entries so UI updates reactively
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}
