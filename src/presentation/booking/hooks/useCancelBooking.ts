import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CancelBookingUseCase } from '@/application/booking/CancelBookingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';
import { bookingKeys } from '@/presentation/booking/bookingKeys';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const cancelBookingUseCase = new CancelBookingUseCase(bookingRepository);

export function useCancelBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelBookingUseCase.execute(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
