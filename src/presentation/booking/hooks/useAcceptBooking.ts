import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AcceptBookingUseCase } from '@/application/booking/AcceptBookingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';
import { bookingKeys } from '@/presentation/booking/bookingKeys';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const acceptBookingUseCase = new AcceptBookingUseCase(bookingRepository);

export function useAcceptBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      acceptBookingUseCase.execute(id, scheduledFor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
