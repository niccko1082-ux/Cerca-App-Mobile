export type BookingStatus = 'requested' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  listingId: string;
  customerId: string;
  status: BookingStatus;
  requestedAt: string;
  scheduledFor: string | null;
  completedAt: string | null;
  reviewId: string | null;
}

export interface CreateBookingData {
  listingId: string;
  note?: string;
}

export type BookingRole = 'customer' | 'provider';

export interface ListBookingsResult {
  items: Booking[];
  nextCursor: string | null;
}

export interface WriteReviewData {
  rating: number;
  body: string;
}

export type DeclineReason = 'unavailable' | 'not_a_fit' | 'other';
