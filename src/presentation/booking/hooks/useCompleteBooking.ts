import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CompleteBookingUseCase } from '@/application/booking/CompleteBookingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';
import { bookingKeys } from '@/presentation/booking/bookingKeys';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const completeBookingUseCase = new CompleteBookingUseCase(bookingRepository);

export function useCompleteBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeBookingUseCase.execute(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
