
import { apiClient } from "./api";
import type { Brochure, Course, CourseFormData, PaginationMeta } from "@/types/course";

export interface CourseQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'draft' | 'published';
}

export interface GetCoursesResponse {
    pagination: any;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: Course[];
}

export interface CourseResponse {
    courses: Course[];
    pagination: PaginationMeta;
}

export const courseService = {
    getAllCourses: async (params: CourseQueryParams = {}): Promise<GetCoursesResponse> => {
        const queryString = new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = String(value);
                }
                return acc;
            }, {} as Record<string, string>)
        ).toString();

        const response = await apiClient.get(`/courses/get-course-admin?${queryString}`);
        return response.data;
    },

    getCourseById: async (id: string): Promise<Course> => {
        const response = await apiClient.get<Course>(`/courses/get-course-details${id}`);
        return response.data;
    },

    getCourseBySlug: async (slug: string): Promise<Course> => {
        const response = await apiClient.get<Course>(`/courses/slug/${slug}`);
        return response.data;
    },

    updateCourseStatus: async (
        slug: string,
        status: 'draft' | 'published'
    ): Promise<Course> => {
        const response = await apiClient.put<Course>(
            `/courses/courses-status/${slug}`,
            { status }
        );
        return response.data;
    },


    deleteCourse: async (id: string): Promise<void> => {
        await apiClient.delete(`/courses/delete-course/${id}`);
    },

    // ============= COURSE CREATION FLOW =============

    // Step 1: Create course with overview only
    createCourseOverview: async (overview: CourseFormData['overview']): Promise<{ message: string; course: Course }> => {
        const formData = new FormData();

        // Add file if present
        if (overview.courseImage instanceof File) {
            formData.append('courseImage', overview.courseImage);
        }

        // Add other fields as JSON
        const overviewData = { ...overview };
        delete overviewData.courseImage;

        formData.append('overview', JSON.stringify(overviewData));

        const response = await apiClient.post<{ message: string; course: Course }>(
            '/courses/courses-overview',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Step 2: Update individual sections by slug
    updateCourseOverview: async (slug: string, data: CourseFormData['overview']) => {
        const response = await apiClient.put(`/courses/courses-overview/${slug}`, data);
        return response.data;
    },

    updateDocumentsRequired: async (slug: string, data: CourseFormData['documentsRequired']) => {
        const response = await apiClient.put(`/courses/courses-documents-required/${slug}`, data);
        return response.data;
    },

    updateVisaProcess: async (slug: string, data: CourseFormData['visaProcess']) => {
        const response = await apiClient.put(`/courses/courses-visa-process/${slug}`, data);
        return response.data;
    },

    updateCareerOpportunities: async (slug: string, data: CourseFormData['careerOpportunities']) => {
        const response = await apiClient.put(`/courses/courses-career-opportunities/${slug}`, data);
        return response.data;
    },

    updateStudyCenters: async (slug: string, data: CourseFormData['studyCenters']) => {
        const response = await apiClient.put(`/courses/courses-study-centers/${slug}`, data);
        return response.data;
    },

    // updateBrochure: async (slug: string, data: CourseFormData['brochure']) => {
    //   const response = await apiClient.put(`/courses/courses-brochure/${slug}`, data);
    //   return response.data;
    // },

    updateDynamicFields: async (slug: string, data: CourseFormData['dynamicFields']) => {
        const response = await apiClient.put(`/courses/courses-dynamicFields/${slug}`, data);
        return response.data;
    },

    uploadBrochure: async (file: File, slug: string): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ url: string }>(`/courses/courses-upload/brochure/${slug}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateBrochure: async (slug: string, brochures: Brochure[]): Promise<void> => {
        await apiClient.put(`/courses/courses-brochure/${slug}`, { brochures });
    },

    deleteBrochure: async (slug: string, fileUrl: string): Promise<void> => {
        await apiClient.delete(`/courses/courses-brochure/${slug}`, {
            data: { fileUrl }
        });
    },



    // // Upload course image
    // uploadCourseImage: async (file: File): Promise<{ url: string }> => {
    //   const formData = new FormData();
    //   formData.append('file', file);
    //   const response = await apiClient.post<{ url: string }>('/courses/upload/image', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   });
    //   return response.data;
    // },

    // Upload brochure
    // uploadBrochure: async (file: File): Promise<{ url: string }> => {
    //   const formData = new FormData();
    //   formData.append('file', file);
    //   const response = await apiClient.post<{ url: string }>('/courses/upload/brochure', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   });
    //   return response.data;
    // },
};