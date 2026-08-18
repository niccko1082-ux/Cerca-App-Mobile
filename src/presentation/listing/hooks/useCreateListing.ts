import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateListingUseCase } from '@/application/listing/CreateListingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { CreateListingData } from '@/domain/listing/Listing';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const createListingUseCase = new CreateListingUseCase(listingRepository);

export function useCreateListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingData) => createListingUseCase.execute(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listingKeys.mine() });
    },
  });
}
