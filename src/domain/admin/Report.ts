// src/domain/admin/Report.ts

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type ReportTargetType = 'listing' | 'review' | 'user';
export type ListingModerationStatus = 'active' | 'under_review' | 'removed';
export type ReviewModerationStatus = 'approved' | 'hidden' | 'removed';

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  reason: string;
  reporterId: string;
  reporterName?: string;
  createdAt: string;
  status: ReportStatus;
  authorId?: string; // Para validar la capa extra 'no ser el autor' en review:moderate
}

export interface ModerateListingData {
  listingId: string;
  status: ListingModerationStatus;
  reason?: string;
}

export interface ModerateReviewData {
  reviewId: string;
  status: ReviewModerationStatus;
  reason?: string;
  actorId?: string;
}

export interface SuspendUserData {
  userId: string;
  reason?: string;
}
