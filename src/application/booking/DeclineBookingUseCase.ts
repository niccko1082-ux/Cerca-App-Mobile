import { Booking, DeclineReason } from '@/domain/booking/Booking';
import { BookingRepository } from '@/domain/booking/BookingRepository';

export class DeclineBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(id: string, reason: DeclineReason): Promise<Booking> {
    if (!id) {
      throw new Error('El identificador de la reserva es requerido.');
    }
    return this.bookingRepository.decline(id, reason);
  }
}
