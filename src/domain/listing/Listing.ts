export interface Money {
  readonly amountMinor: number;
  readonly currency: string;
}

export type Pricing =
  | { model: 'fixed'; price: Money }
  | { model: 'hourly'; hourlyRate: Money; minimumHours: number }
  | { model: 'quote'; startingFrom?: Money };

export type ListingStatus = 'draft' | 'published' | 'paused' | 'under_review' | 'removed';

export interface Category {
  id: string;
  slug: string;
  name: string;
}

// Forma que devuelve GET /listings — más liviana que el detalle.
export interface ListingSummary {
  id: string;
  title: string;
  categoryId: string;
  // null cuando el modelo es 'quote' sin startingFrom — verificado contra el backend real.
  priceFrom: Money | null;
  status: ListingStatus;
  ratingAvg: number;
  ratingCount: number;
  distanceMeters?: number;
}

// Forma que devuelve GET /listings/{id}.
export interface ListingDetail {
  id: string;
  ownerId: string;
  categoryId: string;
  title: string;
  description: string;
  pricing: Pricing;
  priceFrom: Money | null;
  status: ListingStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface SearchListingsResult {
  items: ListingSummary[];
  nextCursor: string | null;
}

export interface MyListingsResult {
  items: ListingDetail[];
  nextCursor: string | null;
}

export interface CreateListingData {
  categoryId: string;
  title: string;
  description: string;
  pricing: Pricing;
  location: { lat: number; lng: number };
}

// UpdateListingDto real: solo title/description/pricing — categoría y
// ubicación no se pueden editar una vez publicado el anuncio.
export interface UpdateListingData {
  title: string;
  description: string;
  pricing: Pricing;
}
