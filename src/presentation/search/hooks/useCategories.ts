import { useQuery } from '@tanstack/react-query';

import { GetCategoriesUseCase } from '@/application/listing/GetCategoriesUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const getCategoriesUseCase = new GetCategoriesUseCase(listingRepository);

export function useCategories() {
  return useQuery({
    queryKey: listingKeys.categories(),
    queryFn: () => getCategoriesUseCase.execute(),
    staleTime: 1000 * 60 * 30,
  });
}
