import { apiClient } from './api';
import type {
  EgAcademyCourse,
  EgAcademyCourseListResponse,
  EgAcademyFeeStructure,
  EgAcademyLearningCenter,
  EgAcademyOverview,
  EgAcademyQueryParams,
} from '@/types/egAcademyCourse';

const BASE = '/eg-academy/courses';

export const egAcademyCourseService = {
  // GET all (paginated)
  getAllCourses: async (params: EgAcademyQueryParams = {}): Promise<EgAcademyCourseListResponse> => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await apiClient.get<EgAcademyCourseListResponse>(`${BASE}?${queryString}`);
    return response.data;
  },

  // GET by slug
  getCourseBySlug: async (slug: string): Promise<EgAcademyCourse> => {
    const response = await apiClient.get<{ success: boolean; data: EgAcademyCourse }>(`${BASE}/${slug}`);
    return response.data.data;
  },

  // POST create course (multipart/form-data: courseImage + overview JSON)
  createCourse: async (
    overview: EgAcademyOverview
  ): Promise<{ message: string; course: EgAcademyCourse }> => {
    const formData = new FormData();

    if (overview.courseImage instanceof File) {
      formData.append('courseImage', overview.courseImage);
    }

    const overviewData = { ...overview };
    delete overviewData.courseImage;
    formData.append('overview', JSON.stringify(overviewData));

    const response = await apiClient.post<{ message: string; course: EgAcademyCourse }>(
      BASE,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // PUT update overview (multipart/form-data)
  updateOverview: async (
    slug: string,
    overview: EgAcademyOverview
  ): Promise<{ message: string; course: EgAcademyCourse }> => {
    const formData = new FormData();

    if (overview.courseImage instanceof File) {
      formData.append('courseImage', overview.courseImage);
    }

    const overviewData = { ...overview };
    delete overviewData.courseImage;
    formData.append('overview', JSON.stringify(overviewData));

    const response = await apiClient.put<{ message: string; course: EgAcademyCourse }>(
      `${BASE}/${slug}/overview`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // POST add learning center
  addLearningCenter: async (
    slug: string,
    data: Omit<EgAcademyLearningCenter, '_id'>
  ): Promise<{ message: string; course: EgAcademyCourse }> => {
    const response = await apiClient.post<{ message: string; course: EgAcademyCourse }>(
      `${BASE}/${slug}/learning-centers`,
      data
    );
    return response.data;
  },

  // PUT update learning center
  updateLearningCenter: async (
    slug: string,
    centerId: string,
    data: Partial<EgAcademyLearningCenter>
  ): Promise<{ message: string; course: EgAcademyCourse }> => {
    const response = await apiClient.put<{ message: string; course: EgAcademyCourse }>(
      `${BASE}/${slug}/learning-centers/${centerId}`,
      data
    );
    return response.data;
  },

  // DELETE learning center
  deleteLearningCenter: async (
    slug: string,
    centerId: string
  ): Promise<{ message: string; course: EgAcademyCourse }> => {
    const response = await apiClient.delete<{ message: string; course: EgAcademyCourse }>(
      `${BASE}/${slug}/learning-centers/${centerId}`
    );
    return response.data;
  },

  // PUT update fee structure of a center
  updateLearningCenterFee: async (
    slug: string,
    centerId: string,
    fee: EgAcademyFeeStructure
  ): Promise<{ message: string; course: EgAcademyCourse }> => {
    const response = await apiClient.put<{ message: string; course: EgAcademyCourse }>(
      `${BASE}/${slug}/learning-centers/${centerId}/fee`,
      fee
    );
    return response.data;
  },

  // PUT update status
  updateStatus: async (
    slug: string,
    status: 'draft' | 'published'
  ): Promise<{ message: string; course: EgAcademyCourse }> => {
    const response = await apiClient.put<{ message: string; course: EgAcademyCourse }>(
      `${BASE}/${slug}/status`,
      { status }
    );
    return response.data;
  },

  // DELETE course by ID
  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
