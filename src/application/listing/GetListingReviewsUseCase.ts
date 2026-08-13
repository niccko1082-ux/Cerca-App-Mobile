import { ListingRepository } from '@/domain/listing/ListingRepository';
import { ListReviewsResult } from '@/domain/listing/Review';

export class GetListingReviewsUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(listingId: string, cursor?: string): Promise<ListReviewsResult> {
    return this.listingRepository.getReviews(listingId, cursor);
  }
}
