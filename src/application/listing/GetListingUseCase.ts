import { ListingDetail } from '@/domain/listing/Listing';
import { ListingRepository } from '@/domain/listing/ListingRepository';

export class GetListingUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(id: string): Promise<ListingDetail> {
    return this.listingRepository.getById(id);
  }
}
