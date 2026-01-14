// services/visaService.ts

import type { CreateVisaDto, SingleVisaResponse, UpdateVisaDto, Visa, VisaMutationResponse, } from "@/types/visa";
import { apiClient } from "./api";


interface GetAllVisasParams {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    status?: string;
}

interface GetAllVisasResponse {
    success: boolean;
    data: Visa[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}


export const visaService = {
    async getAllVisas(params?: GetAllVisasParams): Promise<GetAllVisasResponse> {
        try {
            const response = await apiClient.get<GetAllVisasResponse>('/visas', { params });
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