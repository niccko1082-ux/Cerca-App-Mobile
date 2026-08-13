import { MyListingsResult } from '@/domain/listing/Listing';
import { ListingRepository } from '@/domain/listing/ListingRepository';

export class GetMyListingsUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(cursor?: string): Promise<MyListingsResult> {
    return this.listingRepository.getMine(cursor);
  }
}
