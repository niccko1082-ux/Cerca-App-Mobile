import { CreateListingData, ListingDetail } from '@/domain/listing/Listing';
import { ListingRepository } from '@/domain/listing/ListingRepository';
import { createListingSchema } from '@/domain/listing/schemas/createListing.schema';

export class CreateListingUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(data: CreateListingData): Promise<ListingDetail> {
    const validated = createListingSchema.parse(data);
    return this.listingRepository.create(validated);
  }
}
