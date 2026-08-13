import { useQuery } from '@tanstack/react-query';

import { ListMyBookingsUseCase } from '@/application/booking/ListMyBookingsUseCase';
import { API_BASE_URL } from '@/constants/api';
import { BookingRole } from '@/domain/booking/Booking';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';
import { bookingKeys } from '@/presentation/booking/bookingKeys';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const listMyBookingsUseCase = new ListMyBookingsUseCase(bookingRepository);

export function useMyBookings(role: BookingRole) {
  return useQuery({
    queryKey: bookingKeys.mine(role),
    queryFn: () => listMyBookingsUseCase.execute(role),
  });
}
