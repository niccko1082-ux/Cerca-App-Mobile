import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PublishListingUseCase } from '@/application/listing/PublishListingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const publishListingUseCase = new PublishListingUseCase(listingRepository);

export function usePublishListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishListingUseCase.execute(id),
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: listingKeys.mine() });
      qc.invalidateQueries({ queryKey: listingKeys.searches() });
      qc.invalidateQueries({ queryKey: listingKeys.detail(listing.id) });
    },
  });
}
