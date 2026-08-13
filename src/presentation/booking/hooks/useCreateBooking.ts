import { useMutation } from '@tanstack/react-query';

import { CreateBookingUseCase } from '@/application/booking/CreateBookingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { CreateBookingData } from '@/domain/booking/Booking';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const createBookingUseCase = new CreateBookingUseCase(bookingRepository);

export function useCreateBooking() {
  return useMutation({
    mutationFn: (data: CreateBookingData) => createBookingUseCase.execute(data),
  });
}
