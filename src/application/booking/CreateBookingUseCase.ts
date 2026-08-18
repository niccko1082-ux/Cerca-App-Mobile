import { Booking, CreateBookingData } from '@/domain/booking/Booking';
import { BookingRepository } from '@/domain/booking/BookingRepository';

export class CreateBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(data: CreateBookingData): Promise<Booking> {
    if (!data.listingId) {
      throw new Error('El identificador del anuncio es requerido.');
    }
    return this.bookingRepository.create(data);
  }
}
