import { Booking } from '@/domain/booking/Booking';
import { BookingRepository } from '@/domain/booking/BookingRepository';

export class CompleteBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(id: string): Promise<Booking> {
    if (!id) {
      throw new Error('El identificador de la reserva es requerido.');
    }
    return this.bookingRepository.complete(id);
  }
}
