import type { University, UniversityListResponse, UniversityQueryParams, UniversityResponse } from '../types/university';
import { apiClient } from './api';

export const universityService = {
    getAllUniversities: async (params: UniversityQueryParams): Promise<UniversityListResponse> => {
        const response = await apiClient.get<UniversityListResponse>(`/universities/get-all-universities`, {
            params,
        });
        return response.data;
    },
    createUniversity: async (data: FormData): Promise<UniversityResponse> => {
        const response = await apiClient.post<UniversityResponse>(
            `/universities/create-universities`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Get single university
    getUniversityById: async (id: string): Promise<UniversityResponse> => {
        const response = await apiClient.get<UniversityResponse>(`/universities/${id}`);
        return response.data;
    },

    // Update university
    updateUniversity: async (id: string, data: FormData | Partial<University>): Promise<UniversityResponse> => {
        const headers = data instanceof FormData
            ? { 'Content-Type': 'multipart/form-data' }
            : { 'Content-Type': 'application/json' };

        const response = await apiClient.put<UniversityResponse>(
            `/universities/${id}`,
            data,
            { headers }
        );
        return response.data;
    },

    // Delete university
    deleteUniversity: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/universities/delete-universities/${id}`);
        return response.data;
    },

    // Get university by slug
    getUniversityBySlug: async (slug: string): Promise<UniversityResponse> => {
        const response = await apiClient.get<UniversityResponse>(`/universities/get-universities-slug/${slug}`);
        return response.data;
    },
};
