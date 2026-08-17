import { Booking } from '@/domain/booking/Booking';
import { BookingRepository } from '@/domain/booking/BookingRepository';

export class GetBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(id: string): Promise<Booking> {
    return this.bookingRepository.getById(id);
  }
}
