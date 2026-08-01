import { apiClient } from './api';
import type {
  EgAcademyCourse,
  EgAcademyCourseListResponse,
  EgAcademyFeeStructure,
  EgAcademyLearningCenter,
  EgAcademyOverview,
  EgAcademyQueryParams,
} from '@/types/egAcademyCourse';

const BASE = '/academy-courses';

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

  // POST create course.
  //
  // JSON, not multipart: the API decodes the whole course document. The image is
  // a separate PATCH because it goes through the media middleware, which is what
  // uploads it to Cloudinary and hands the handler a finished URL.
  createCourse: async (overview: EgAcademyOverview): Promise<EgAcademyCourse> => {
    const { courseImage, ...rest } = overview;
    const response = await apiClient.post<{ data: EgAcademyCourse }>(BASE, {
      overview: rest,
    });
    const created = response.data.data;
    if (courseImage instanceof File) {
      return egAcademyCourseService.updateImage(created.slug, courseImage);
    }
    return created;
  },

  // PATCH the course image on its own.
  updateImage: async (slug: string, file: File): Promise<EgAcademyCourse> => {
    const formData = new FormData();
    formData.append('courseImage', file);
    const response = await apiClient.patch<{ data: EgAcademyCourse }>(
      `${BASE}/${slug}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  // PATCH the overview section. Only the fields the API accepts are sent — the
  // slug is derived from the course name server-side, not posted.
  updateOverview: async (
    slug: string,
    overview: EgAcademyOverview
  ): Promise<EgAcademyCourse> => {
    const { courseImage, ...rest } = overview;
    // The slug is derived from the course name server-side; posting the form's
    // computed one would be ignored at best and misleading at worst.
    const fields = { ...rest, slug: undefined };
    delete fields.slug;
    const response = await apiClient.patch<{ data: EgAcademyCourse }>(
      `${BASE}/${slug}/section/overview`,
      fields
    );
    const updated = response.data.data;
    if (courseImage instanceof File) {
      return egAcademyCourseService.updateImage(updated.slug, courseImage);
    }
    return updated;
  },

  // POST add learning centre
  addLearningCenter: async (
    slug: string,
    data: Omit<EgAcademyLearningCenter, '_id'>
  ): Promise<EgAcademyCourse> => {
    const response = await apiClient.post<{ data: EgAcademyCourse }>(
      `${BASE}/${slug}/centers`,
      data
    );
    return response.data.data;
  },

  // PUT update learning centre
  updateLearningCenter: async (
    slug: string,
    centerId: string,
    data: Partial<EgAcademyLearningCenter>
  ): Promise<EgAcademyCourse> => {
    const response = await apiClient.put<{ data: EgAcademyCourse }>(
      `${BASE}/${slug}/centers/${centerId}`,
      data
    );
    return response.data.data;
  },

  // DELETE learning centre
  deleteLearningCenter: async (slug: string, centerId: string): Promise<EgAcademyCourse> => {
    const response = await apiClient.delete<{ data: EgAcademyCourse }>(
      `${BASE}/${slug}/centers/${centerId}`
    );
    return response.data.data;
  },

  // PATCH the fee table of one centre — its own endpoint, so a centre save that
  // omits the fees cannot wipe them.
  updateLearningCenterFee: async (
    slug: string,
    centerId: string,
    fee: EgAcademyFeeStructure
  ): Promise<EgAcademyCourse> => {
    const response = await apiClient.patch<{ data: EgAcademyCourse }>(
      `${BASE}/${slug}/centers/${centerId}/fee`,
      fee
    );
    return response.data.data;
  },

  // PATCH publish state
  updateStatus: async (
    slug: string,
    status: 'draft' | 'published'
  ): Promise<EgAcademyCourse> => {
    const response = await apiClient.patch<{ data: EgAcademyCourse }>(
      `${BASE}/${slug}/status`,
      { status }
    );
    return response.data.data;
  },

  // DELETE course by ID
  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
