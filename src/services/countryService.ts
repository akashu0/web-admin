// services/countryService.ts
import type { CountryResponse, ICountry, UpdateCountryDto } from '@/types/country';
import { apiClient } from './api';

interface PaginationResponse {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface CountryListResponse {
    success: boolean;
    data: ICountry[];
    pagination: PaginationResponse;
}
interface CountryByIdResponse {
    success: boolean;
    data: ICountry;
    message?: string;
}

interface CountryResponseData {
    success: boolean;
    data: CountryResponse;
    message?: string;
}

export interface CountryQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'draft' | 'published' | 'all';
    continent?: string;
}

export const countryService = {
    async getAllCountries(params?: CountryQueryParams): Promise<CountryListResponse> {
        try {
            const response = await apiClient.get<CountryListResponse>('/countries', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw error;
        }
    },

    // Continents that records actually carry, so the filter never offers one
    // with nothing behind it.
    async getFacets(): Promise<{ continents: string[] }> {
        const response = await apiClient.get<{ data: { continents: string[] } }>('/countries/facets');
        return response.data.data;
    },

    async getCountryById(id: string): Promise<CountryByIdResponse> {
        try {
            const response = await apiClient.get<CountryByIdResponse>(`/countries/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching country:', error);
            throw error;
        }
    },

    async getCountryBySlug(slug: string): Promise<CountryResponseData> {
        try {
            const response = await apiClient.get<CountryResponseData>(`/countries/${slug}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching country by slug:', error);
            throw error;
        }
    },

    async createCountry(formData: FormData): Promise<CountryResponseData> {
        try {

            const response = await apiClient.post<CountryResponseData>('/countries', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating country:', error);
            throw error;
        }
    },

    async updateCountry(id: string, data: UpdateCountryDto): Promise<CountryResponseData> {
        try {
            const formData = new FormData();

            Object.keys(data).forEach((key) => {
                const value = data[key as keyof UpdateCountryDto];

                if (value === undefined || value === null) return;

                if (key === 'logo' || key === 'banner') {
                    if (value instanceof File) {
                        formData.append(key, value);
                    }
                } else if (Array.isArray(value) || typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            });

            const response = await apiClient.patch<CountryResponseData>(`/countries/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating country:', error);
            throw error;
        }
    },

    async deleteCountry(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete(`/countries/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting country:', error);
            throw error;
        }
    },

    async updateCountryStatus(id: string, status: 'published' | 'draft'): Promise<CountryResponse> {
        try {
            const response = await apiClient.patch<CountryResponse>(`/countries/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating country status:', error);
            throw error;
        }
    },

    async getCountriesByContinent(continent: string): Promise<{ success: boolean; data: ICountry[] }> {
        try {
            const response = await apiClient.get(`/countries?continent=${encodeURIComponent(continent)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching countries by continent:', error);
            throw error;
        }
    },

    async updateCountryBasicInfo(id: string, data: any): Promise<CountryResponseData> {
        try {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                const value = data[key];
                if (value !== undefined && value !== null) {
                    if (value instanceof File) {
                        formData.append(key, value);
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            const response = await apiClient.patch<CountryResponseData>(
                `/countries/${id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            return response.data;
        } catch (error) {
            console.error('Error updating basic info:', error);
            throw error;
        }
    },

    async updateCountryIntakePeriods(id: string, intakePeriods: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.patch<CountryResponseData>(`/countries/${id}`, { intakePeriods });
            return response.data;
        } catch (error) {
            console.error('Error updating intake periods:', error);
            throw error;
        }
    },

    async updateCountryScholarships(id: string, scholarships: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.patch<CountryResponseData>(`/countries/${id}`, { scholarships });
            return response.data;
        } catch (error) {
            console.error('Error updating scholarships:', error);
            throw error;
        }
    },

    async updateCountryCostOfLiving(id: string, costOfLiving: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.patch<CountryResponseData>(`/countries/${id}`, { costOfLiving });
            return response.data;
        } catch (error) {
            console.error('Error updating cost of living:', error);
            throw error;
        }
    },

    async updateCountryExams(id: string, examsEligibility: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.patch<CountryResponseData>(`/countries/${id}`, { examsEligibility });
            return response.data;
        } catch (error) {
            console.error('Error updating exams:', error);
            throw error;
        }
    },

    async updateCountryWorkOpportunities(id: string, workOpportunities: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.patch<CountryResponseData>(`/countries/${id}`, { workOpportunities });
            return response.data;
        } catch (error) {
            console.error('Error updating work opportunities:', error);
            throw error;
        }
    },

    async updateCountryReferences(
        id: string,
        data: {
            visaProcessDocuments?: string;
            topUniversities?: string[];
            topCourses?: string[];
        }
    ): Promise<CountryResponseData> {
        try {
            const response = await apiClient.patch<CountryResponseData>(`/countries/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating references:', error);
            throw error;
        }
    },

};