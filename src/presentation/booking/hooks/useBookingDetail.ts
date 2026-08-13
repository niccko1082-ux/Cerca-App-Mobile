import { useQuery } from '@tanstack/react-query';

import { GetBookingUseCase } from '@/application/booking/GetBookingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';
import { bookingKeys } from '@/presentation/booking/bookingKeys';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const getBookingUseCase = new GetBookingUseCase(bookingRepository);

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBookingUseCase.execute(id),
    enabled: !!id,
  });
}
