// services/learningCenterService.ts

import type {
    LearningCenter,
    LearningCenterResponse,
    CreateLearningCenterDto,
    LearningCenterListResponse,
    LearningCenterMutationResponse
} from "../types/learningCenter";
import { apiClient } from "./api";

// Transform function to convert _id to id for frontend
const transformLearningCenter = (center: LearningCenterResponse): LearningCenter => ({
    id: center._id,
    name: center.name,
    level: center.level,
    location: center.location,
    createdAt: center.createdAt,
    updatedAt: center.updatedAt,
    country: center.country,
    currency: center.currency,
    programs: center.programs || [],
    isActive: center.isActive,
    documentRequired: center.documentRequired || [],
    centerId: "",
    visa: center.visa
});

export const learningCenterService = {
    async getAllLearningCenters(): Promise<LearningCenter[]> {
        try {
            const response = await apiClient.get<LearningCenterListResponse>("/study-centers/get-studycenters");
            return response.data.data.map(transformLearningCenter);
        } catch (error) {
            console.error("Error fetching learning centers:", error);
            throw error;
        }
    },

    async createLearningCenter(data: CreateLearningCenterDto): Promise<LearningCenter> {
        try {
            const response = await apiClient.post<LearningCenterMutationResponse>("/study-centers/create-studycenter", data);
            return transformLearningCenter(response.data.data);
        } catch (error) {
            console.error("Error creating learning center:", error);
            throw error;
        }
    },

    async updateLearningCenter(id: string, data: Partial<CreateLearningCenterDto>): Promise<LearningCenter> {
        try {
            const response = await apiClient.put<LearningCenterMutationResponse>(`/study-centers/update-studycenter/${id}`, data);
            return transformLearningCenter(response.data.data);
        } catch (error) {
            console.error("Error updating learning center:", error);
            throw error;
        }
    },

    async deleteLearningCenter(id: string): Promise<void> {
        try {
            await apiClient.delete(`/study-centers/delete-studycenter/${id}`);
        } catch (error) {
            console.error("Error deleting learning center:", error);
            throw error;
        }
    },

    async getLearningCenterById(id: string): Promise<LearningCenter> {
        try {
            const response = await apiClient.get<LearningCenterMutationResponse>(`/study-centers/get-studycenter/${id}`);
            return transformLearningCenter(response.data.data);
        } catch (error) {
            console.error("Error fetching learning center:", error);
            throw error;
        }
    },
};