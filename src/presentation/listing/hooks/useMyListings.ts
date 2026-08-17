import { useQuery } from '@tanstack/react-query';

import { GetMyListingsUseCase } from '@/application/listing/GetMyListingsUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const getMyListingsUseCase = new GetMyListingsUseCase(listingRepository);

export function useMyListings() {
  return useQuery({
    queryKey: listingKeys.mine(),
    queryFn: () => getMyListingsUseCase.execute(),
  });
}
