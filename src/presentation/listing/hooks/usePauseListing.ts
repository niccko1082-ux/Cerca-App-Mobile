import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PauseListingUseCase } from '@/application/listing/PauseListingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const pauseListingUseCase = new PauseListingUseCase(listingRepository);

export function usePauseListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pauseListingUseCase.execute(id),
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: listingKeys.mine() });
      qc.invalidateQueries({ queryKey: listingKeys.searches() });
      qc.invalidateQueries({ queryKey: listingKeys.detail(listing.id) });
    },
  });
}
