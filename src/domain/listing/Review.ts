export interface Review {
  id: string;
  bookingId: string;
  listingId: string;
  authorId: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface ListReviewsResult {
  items: Review[];
  nextCursor: string | null;
}
