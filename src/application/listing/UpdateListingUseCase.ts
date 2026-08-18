import { ListingDetail, UpdateListingData } from '@/domain/listing/Listing';
import { ListingRepository } from '@/domain/listing/ListingRepository';
import { updateListingSchema } from '@/domain/listing/schemas/updateListing.schema';

export class UpdateListingUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(id: string, data: UpdateListingData): Promise<ListingDetail> {
    const validated = updateListingSchema.parse(data);
    return this.listingRepository.update(id, validated);
  }
}
