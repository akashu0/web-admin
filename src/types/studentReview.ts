import type { SortParams } from '@/services/api';

/**
 * A review written by a signed-in student on the website.
 *
 * Distinct from the reviews on the University → Reviews tab: those are typed in
 * by staff and stored on the university document itself. These arrive from the
 * public site, live in their own collection, and are moderated here.
 *
 * There is no author id: the API sends the display name and nothing else, so
 * this app has no way to render or leak which account wrote a review.
 */
export interface IStudentReview {
    _id: string;
    entityType: StudentReviewEntityType;
    entityId: string;
    /** Denormalised on the server, so the queue can say what a review is about. */
    entityName?: string;
    authorName?: string;
    rating: number;
    comment: string;
    /** See REVIEW_STATUS_LABELS — the publish state IS the moderation state. */
    status: StudentReviewStatus;
    createdAt: string;
    updatedAt: string;
}

export const STUDENT_REVIEW_ENTITY_TYPES = ['University', 'Course'] as const;
export type StudentReviewEntityType = (typeof STUDENT_REVIEW_ENTITY_TYPES)[number];

/**
 * Moderation runs on the publish state the catalog already has, rather than a
 * second field that could disagree with it. Only `published` is served to the
 * websites — `Status.Public()` on the Go side — so a pending or rejected review
 * is invisible there by construction.
 */
export type StudentReviewStatus = 'draft' | 'published' | 'inactive';

export const REVIEW_STATUS_LABELS: Record<StudentReviewStatus, string> = {
    draft: 'Pending',
    published: 'Approved',
    inactive: 'Rejected',
};

export interface StudentReviewFilters extends SortParams {
    entityType?: StudentReviewEntityType;
    entityId?: string;
    status?: StudentReviewStatus;
    search?: string;
    page?: number;
    limit?: number;
}
