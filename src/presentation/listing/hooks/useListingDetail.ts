import { useQuery } from '@tanstack/react-query';

import { GetListingUseCase } from '@/application/listing/GetListingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { listingKeys } from '@/presentation/search/listingKeys';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const getListingUseCase = new GetListingUseCase(listingRepository);

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => getListingUseCase.execute(id),
    enabled: !!id,
  });
}
