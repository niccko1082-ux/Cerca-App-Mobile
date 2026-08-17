import { useMutation, useQueryClient } from '@tanstack/react-query';

import { WriteReviewUseCase } from '@/application/booking/WriteReviewUseCase';
import { API_BASE_URL } from '@/constants/api';
import { WriteReviewData } from '@/domain/booking/Booking';
import { ApiBookingAdapter } from '@/infrastructure/booking/ApiBookingAdapter';
import { bookingKeys } from '@/presentation/booking/bookingKeys';
import { listingKeys } from '@/presentation/search/listingKeys';

const bookingRepository = new ApiBookingAdapter(API_BASE_URL);
const writeReviewUseCase = new WriteReviewUseCase(bookingRepository);

interface Variables {
  bookingId: string;
  listingId: string;
  data: WriteReviewData;
}

export function useWriteReview() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, data }: Variables) => writeReviewUseCase.execute(bookingId, data),
    onSuccess: (_review, { bookingId, listingId }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: listingKeys.reviews(listingId) });
      qc.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
    },
  });
}
