// services/studyCenterService.ts

import { apiClient } from './api';
import type { SortParams } from '@/services/api';

/**
 * Study centres are read-only here.
 *
 * There is no centres menu in web-admin — the records are authored elsewhere
 * and read by eg-academy (see the comment on the mount in the Go API,
 * internal/catalog/http.go). A course only ever *links* to them, so this
 * service offers the list and nothing that writes.
 */
export interface StudyCenter {
    _id: string;
    slug?: string;
    name: string;
    level?: string;
    location?: string;
    country?: string;
    currency?: string;
    isActive?: boolean;
    logo?: string;
}

interface GetAllStudyCentersParams extends SortParams {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    level?: string;
    status?: string;
}

interface GetAllStudyCentersResponse {
    success: boolean;
    data: StudyCenter[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const studyCenterService = {
    async getAllStudyCenters(
        params?: GetAllStudyCentersParams,
    ): Promise<GetAllStudyCentersResponse> {
        try {
            const response = await apiClient.get<GetAllStudyCentersResponse>('/study-centers', {
                params,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching study centres:', error);
            throw error;
        }
    },

    /**
     * The centres behind a course's `studyCenters[].centerId` list.
     *
     * The staff course endpoint returns the bare ids (only the PUBLIC detail
     * resolves them), so anything that wants to show a centre NAME has to look
     * it up. By id rather than filtering a list, because the list endpoint
     * clamps `limit` to 100 server-side and a centre past that would silently
     * come back missing.
     */
    async getByIds(ids: string[]): Promise<StudyCenter[]> {
        const wanted = ids.filter(Boolean);
        if (!wanted.length) return [];

        const settled = await Promise.all(
            wanted.map(async (id) => {
                try {
                    const { data } = await apiClient.get<{ success: boolean; data: StudyCenter }>(
                        `/study-centers/${id}`,
                    );
                    return data?.data ?? null;
                } catch {
                    // A deleted centre is a gap, not a failed page — the course
                    // still has to render.
                    return null;
                }
            }),
        );
        return settled.filter((c): c is StudyCenter => !!c);
    },
};
