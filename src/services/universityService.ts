import { api } from './api';
import type { University, UniversityFormData } from '../types/university';

export const universityService = {
    getAll: async () => {
        const response = await api.get<University[]>('/universities');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<University>(`/universities/${id}`);
        return response.data;
    },

    create: async (data: UniversityFormData) => {
        const response = await api.post<University>('/universities', data);
        return response.data;
    },

    update: async (id: string, data: UniversityFormData) => {
        const response = await api.put<University>(`/universities/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/universities/${id}`);
        return response.data;
    }
};
