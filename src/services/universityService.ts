import type { University, UniversityFormData } from '../types/university';
import { apiClient } from './api';

export const universityService = {
    getAll: async () => {
        const response = await apiClient.get<University[]>('/universities');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<University>(`/universities/${id}`);
        return response.data;
    },

    create: async (data: UniversityFormData) => {
        const response = await apiClient.post<University>('/universities', data);
        return response.data;
    },

    update: async (id: string, data: UniversityFormData) => {
        const response = await apiClient.put<University>(`/universities/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/universities/${id}`);
        return response.data;
    }
};
