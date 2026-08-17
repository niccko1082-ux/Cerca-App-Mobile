import { BookingRepository } from '@/domain/booking/BookingRepository';
import { WriteReviewData } from '@/domain/booking/Booking';
import { Review } from '@/domain/listing/Review';

export class WriteReviewUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  // La elegibilidad (canReviewBooking) la evalúa la pantalla para decidir si
  // muestra el formulario; el servidor sigue siendo la autoridad final.
  async execute(bookingId: string, data: WriteReviewData): Promise<Review> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('La calificación debe estar entre 1 y 5.');
    }
    if (!data.body.trim()) {
      throw new Error('Escribe algo sobre tu experiencia.');
    }
    return this.bookingRepository.writeReview(bookingId, data);
  }
}
