import { BookingRole } from '@/domain/booking/Booking';

export const bookingKeys = {
  all: ['bookings'] as const,
  mine: (role: BookingRole) => [...bookingKeys.all, 'mine', role] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
} as const;
