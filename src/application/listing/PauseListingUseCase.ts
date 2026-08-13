import { ListingDetail } from '@/domain/listing/Listing';
import { ListingRepository } from '@/domain/listing/ListingRepository';

export class PauseListingUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(id: string): Promise<ListingDetail> {
    return this.listingRepository.pause(id);
  }
}
