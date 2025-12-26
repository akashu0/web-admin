// services/visaService.ts

import type { CreateVisaDto, SingleVisaResponse, UpdateVisaDto, Visa, VisaListResponse, VisaMutationResponse, VisaQueryParams } from "@/types/visa";
import { apiClient } from "./api";





export const visaService = {
    async getAllVisas(params?: VisaQueryParams): Promise<VisaListResponse> {
        try {
            const response = await apiClient.get<VisaListResponse>('/visas', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching visas:', error);
            throw error;
        }
    },

    async getVisaById(id: string): Promise<Visa> {
        try {
            const response = await apiClient.get<SingleVisaResponse>(`/visas/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching visa:', error);
            throw error;
        }
    },

    async createVisa(data: CreateVisaDto): Promise<Visa> {
        try {
            const response = await apiClient.post<VisaMutationResponse>('/visas', data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating visa:', error);
            throw error;
        }
    },

    async updateVisa(id: string, data: UpdateVisaDto): Promise<Visa> {
        try {
            const response = await apiClient.put<VisaMutationResponse>(`/visas/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error updating visa:', error);
            throw error;
        }
    },

    async deleteVisa(id: string): Promise<void> {
        try {
            await apiClient.delete(`/visas/${id}`);
        } catch (error) {
            console.error('Error deleting visa:', error);
            throw error;
        }
    },
};