import { ListingRepository } from '@/domain/listing/ListingRepository';
import { SearchFilters, SearchListingsResult } from '@/domain/listing/Listing';

export class SearchListingsUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(filters: SearchFilters, cursor?: string): Promise<SearchListingsResult> {
    return this.listingRepository.search(filters, cursor);
  }
}
