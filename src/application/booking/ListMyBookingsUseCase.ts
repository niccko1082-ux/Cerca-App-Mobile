import { BookingRole, ListBookingsResult } from '@/domain/booking/Booking';
import { BookingRepository } from '@/domain/booking/BookingRepository';

export class ListMyBookingsUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(role: BookingRole, cursor?: string): Promise<ListBookingsResult> {
    return this.bookingRepository.listMine(role, cursor);
  }
}
