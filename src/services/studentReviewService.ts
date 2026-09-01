import { apiClient } from './api';
import type { IStudentReview, StudentReviewFilters, StudentReviewStatus } from '@/types/studentReview';

interface ListResponse {
    success: boolean;
    data: IStudentReview[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage?: boolean;
        hasPrevPage?: boolean;
    };
}

/**
 * Student reviews, for moderation.
 *
 * There is no create and no update: web-admin decides whether a review is
 * published, never what it says. Editing somebody else's words and then showing
 * them under their name is the one thing this screen must not be able to do.
 */
export const studentReviewService = {
    list: async (filters: StudentReviewFilters = {}): Promise<ListResponse> => {
        const params = new URLSearchParams();
        if (filters.entityType) params.append('entityType', filters.entityType);
        if (filters.entityId) params.append('entityId', filters.entityId);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', String(filters.page));
        if (filters.limit) params.append('limit', String(filters.limit));
        if (filters.sort) {
            params.append('sort', filters.sort);
            params.append('dir', filters.dir ?? 'asc');
        }
        const response = await apiClient.get(`/student-reviews?${params.toString()}`);
        return response.data;
    },

    /** Approve, reject, or send an approved review back to pending. */
    setStatus: async (id: string, status: StudentReviewStatus) => {
        const response = await apiClient.patch(`/student-reviews/${id}/status`, { status });
        return response.data;
    },

    remove: async (id: string) => {
        const response = await apiClient.delete(`/student-reviews/${id}`);
        return response.data;
    },
};
