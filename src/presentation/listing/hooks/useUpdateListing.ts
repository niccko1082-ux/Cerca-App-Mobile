import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateListingUseCase } from '@/application/listing/UpdateListingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { UpdateListingData } from '@/domain/listing/Listing';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const updateListingUseCase = new UpdateListingUseCase(listingRepository);

export function useUpdateListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingData }) =>
      updateListingUseCase.execute(id, data),
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: listingKeys.mine() });
      qc.invalidateQueries({ queryKey: listingKeys.searches() });
      qc.invalidateQueries({ queryKey: listingKeys.detail(listing.id) });
    },
  });
}
