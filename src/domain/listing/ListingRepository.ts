import {
  Category,
  CreateListingData,
  ListingDetail,
  MyListingsResult,
  SearchFilters,
  SearchListingsResult,
  UpdateListingData,
} from './Listing';
import { ListReviewsResult } from './Review';

export interface ListingRepository {
  getCategories(): Promise<Category[]>;
  search(filters: SearchFilters, cursor?: string): Promise<SearchListingsResult>;
  getById(id: string): Promise<ListingDetail>;
  getReviews(listingId: string, cursor?: string): Promise<ListReviewsResult>;
  create(data: CreateListingData): Promise<ListingDetail>;
  update(id: string, data: UpdateListingData): Promise<ListingDetail>;
  getMine(cursor?: string): Promise<MyListingsResult>;
  publish(id: string): Promise<ListingDetail>;
  pause(id: string): Promise<ListingDetail>;
}
