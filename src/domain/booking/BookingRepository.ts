import { Review } from '../listing/Review';
import {
  Booking,
  BookingRole,
  CreateBookingData,
  DeclineReason,
  ListBookingsResult,
  WriteReviewData,
} from './Booking';

export interface BookingRepository {
  create(data: CreateBookingData): Promise<Booking>;
  listMine(role: BookingRole, cursor?: string): Promise<ListBookingsResult>;
  getById(id: string): Promise<Booking>;
  cancel(id: string): Promise<Booking>;
  writeReview(bookingId: string, data: WriteReviewData): Promise<Review>;
  accept(id: string, scheduledFor: string): Promise<Booking>;
  decline(id: string, reason: DeclineReason): Promise<Booking>;
  complete(id: string): Promise<Booking>;
}
