import { useQuery } from '@tanstack/react-query';

import { GetListingReviewsUseCase } from '@/application/listing/GetListingReviewsUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const getListingReviewsUseCase = new GetListingReviewsUseCase(listingRepository);

export function useListingReviews(listingId: string) {
  return useQuery({
    queryKey: listingKeys.reviews(listingId),
    queryFn: () => getListingReviewsUseCase.execute(listingId),
    enabled: !!listingId,
  });
}
