import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DeclineBookingUseCase } from '@/application/booking/DeclineBookingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { DeclineReason } from '@/domain/booking/Booking';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';
import { bookingKeys } from '@/presentation/booking/bookingKeys';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const declineBookingUseCase = new DeclineBookingUseCase(bookingRepository);

export function useDeclineBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: DeclineReason }) =>
      declineBookingUseCase.execute(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
