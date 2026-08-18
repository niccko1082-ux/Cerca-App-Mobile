import { Category } from '@/domain/listing/Listing';
import { ListingRepository } from '@/domain/listing/ListingRepository';

export class GetCategoriesUseCase {
  constructor(private listingRepository: ListingRepository) {}

  async execute(): Promise<Category[]> {
    return this.listingRepository.getCategories();
  }
}
