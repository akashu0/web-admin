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

interface CountryResponseData {
    success: boolean;
    data: CountryResponse;
    message?: string;
}

export const countryService = {
    async getAllCountries(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<CountryListResponse> {
        try {


            const response = await apiClient.get<CountryListResponse>('/country/get-all-country', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw error;
        }
    },

    async getCountryById(id: string): Promise<CountryResponseData> {
        try {
            const response = await apiClient.get<CountryResponseData>(`/country/get-country/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching country:', error);
            throw error;
        }
    },

    async getCountryBySlug(slug: string): Promise<CountryResponseData> {
        try {
            const response = await apiClient.get<CountryResponseData>(`/countries/slug/${slug}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching country by slug:', error);
            throw error;
        }
    },

    async createCountry(formData: FormData): Promise<CountryResponseData> {
        try {

            const response = await apiClient.post<CountryResponseData>('/country/create-country', formData, {
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

            const response = await apiClient.put<CountryResponseData>(`/countries/${id}`, formData, {
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
            const response = await apiClient.delete(`/country/delete-country/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting country:', error);
            throw error;
        }
    },

    async updateCountryStatus(id: string, status: 'published' | 'draft'): Promise<CountryResponse> {
        try {
            const response = await apiClient.patch<CountryResponse>(`/country/update-country-status/${id}`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating country status:', error);
            throw error;
        }
    },

    async getCountriesByContinent(continent: string): Promise<{ success: boolean; data: ICountry[] }> {
        try {
            const response = await apiClient.get(`/countries/continent/${continent}`);
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

            const response = await apiClient.put<CountryResponseData>(
                `/country/update-country-basic-info/${id}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating basic info:', error);
            throw error;
        }
    },

    async updateCountryIntakePeriods(id: string, intakePeriods: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.put<CountryResponseData>(
                `/country/update-country-intake-periods/${id}`,
                { intakePeriods }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating intake periods:', error);
            throw error;
        }
    },

    async updateCountryScholarships(id: string, scholarships: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.put<CountryResponseData>(
                `/country/update-country-scholarships/${id}`,
                { scholarships }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating scholarships:', error);
            throw error;
        }
    },

    async updateCountryCostOfLiving(id: string, costOfLiving: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.put<CountryResponseData>(
                `/country/update-country-cost-of-living/${id}`,
                { costOfLiving }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating cost of living:', error);
            throw error;
        }
    },

    async updateCountryExams(id: string, examsEligibility: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.put<CountryResponseData>(
                `/country/update-country-exams/${id}`,
                { examsEligibility }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating exams:', error);
            throw error;
        }
    },

    async updateCountryWorkOpportunities(id: string, workOpportunities: any[]): Promise<CountryResponseData> {
        try {
            const response = await apiClient.put<CountryResponseData>(
                `/country/update-country-work-opportunities/${id}`,
                { workOpportunities }
            );
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
            const response = await apiClient.put<CountryResponseData>(
                `/country/update-country-references/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error updating references:', error);
            throw error;
        }
    },

};