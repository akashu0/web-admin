
import { apiClient } from "./api";
import type { Course, CourseFormData, PaginationMeta } from "@/types/course";
import type { SortParams } from '@/services/api';

export interface CourseQueryParams extends SortParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'draft' | 'published' | 'all';
    stream?: string;
    country?: string;
    level?: string;
    studyMode?: string;
    awardedBy?: string;
    /** Months, as the website sends them — the API matches years too. */
    duration?: string;
    scholarship?: string;
}

// The values that actually occur in the catalogue. The enums drifted from the
// data long ago (most courses say "undergraduate", which is in no enum), so the
// filter dropdowns are built from this, not from a hardcoded list.
export interface CourseFacets {
    levels: string[];
    studyModes: string[];
    streams: string[];
    awardedBy: string[];
    durations: string[];
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

        const response = await apiClient.get(`/courses?${queryString}`);
        return response.data;
    },

    // Narrowed by country the way the website's dependent dropdowns are, so
    // picking a country shrinks the level/awarded-by lists to what it teaches.
    getFacets: async (country?: string, status?: string): Promise<CourseFacets> => {
        const response = await apiClient.get<{ data: CourseFacets }>('/courses/facets', {
            params: { country: country || undefined, status: status || undefined },
        });
        return response.data.data;
    },

    // Both of these unwrap the shared envelope — the API answers
    // { success, data }, and returning the envelope made `course.overview`
    // undefined, which is what threw in the editor before it could render.
    getCourseById: async (id: string): Promise<Course> => {
        const response = await apiClient.get<{ data: Course }>(`/courses/${id}`);
        return response.data.data;
    },

    getCourseBySlug: async (slug: string): Promise<Course> => {
        const response = await apiClient.get<{ data: Course }>(`/courses/${slug}`);
        return response.data.data;
    },

    updateCourseStatus: async (
        slug: string,
        status: 'draft' | 'published'
    ): Promise<Course> => {
        const response = await apiClient.patch<{ data: Course }>(
            `/courses/${slug}/status`,
            { status }
        );
        return response.data.data;
    },


    deleteCourse: async (id: string): Promise<void> => {
        await apiClient.delete(`/courses/${id}`);
    },

    // ============= COURSE CREATION FLOW =============

    // Step 1: create with the overview only.
    //
    // JSON, not multipart: the API decodes the whole course document. The image
    // goes through the media middleware on its own endpoint, which is what
    // uploads it and hands the handler a finished URL.
    createCourseOverview: async (overview: CourseFormData['overview']): Promise<Course> => {
        const { courseImage, ...rest } = overview;
        const response = await apiClient.post<{ data: Course }>('/courses', {
            overview: rest,
        });
        const created = response.data.data;
        if (courseImage instanceof File) {
            return courseService.updateCourseImage(created.slug, courseImage);
        }
        return created;
    },

    updateCourseImage: async (slug: string, file: File): Promise<Course> => {
        const formData = new FormData();
        formData.append('courseImage', file);
        const response = await apiClient.patch<{ data: Course }>(
            `/courses/${slug}/image`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data;
    },

    // Step 2: Update individual sections by slug
    updateCourseOverview: async (slug: string, data: CourseFormData['overview']) => {
        // The overview is a section save like every other tab: PATCH the fields,
        // and send a newly-picked image to the image endpoint. The old route
        // (PUT /courses/courses-overview/:slug) does not exist on this API.
        const { courseImage, ...fields } = data;
        // A new image goes to the upload endpoint; an explicit `null` means the
        // editor cleared it, and only an empty string sent through the section
        // save can actually remove a stored one.
        const body = courseImage === null ? { ...fields, courseImage: "" } : fields;
        const response = await apiClient.patch<{ data: Course }>(
            `/courses/${slug}/section/overview`,
            body
        );
        const updated = response.data.data;
        if (courseImage instanceof File) {
            return courseService.updateCourseImage(updated.slug, courseImage);
        }
        return updated;
    },

    updateDocumentsRequired: async (slug: string, data: CourseFormData['documentsRequired']) => {
        const response = await apiClient.patch(`/courses/${slug}/section/documents-required`, data);
        return response.data;
    },

    updateVisaProcess: async (slug: string, data: CourseFormData['visaProcess']) => {
        const response = await apiClient.patch(`/courses/${slug}/section/visa-process`, data);
        return response.data;
    },
    updateFeeStructure: async (slug: string, data: CourseFormData['feeStructures']) => {
        const response = await apiClient.patch(`/courses/${slug}/section/fee-structures`, data);
        return response.data;
    },

    updateCareerOpportunities: async (slug: string, data: CourseFormData['careerOpportunities']) => {
        const response = await apiClient.patch(`/courses/${slug}/section/career-opportunities`, data);
        return response.data;
    },

    /**
     * The "University" tab. `universityId` is a TOP-LEVEL course field and the
     * OVERVIEW section save is the only one that writes it (courseSet in the Go
     * API parses and validates the hex there, and an empty string clears it).
     *
     * PATCHing /section/study-centers stored the whole request body under
     * `studyCenters` — so the link was never saved AND the typed array was
     * replaced by an object. This tab has no centre picker; it only picks a
     * university.
     */
    updateStudyCenters: async (slug: string, data: { universityId?: string }) => {
        const response = await apiClient.patch(`/courses/${slug}/section/overview`, {
            universityId: data.universityId ?? "",
        });
        return response.data;
    },

    updateDynamicFields: async (slug: string, data: CourseFormData['dynamicFields']) => {
        const response = await apiClient.patch(`/courses/${slug}/section/dynamic-fields`, data);
        return response.data;
    },

    // Uploading appends the brochure to the course server-side and returns the
    // whole updated course, so there is nothing for the client to assemble — and
    // no wholesale PUT of the list (that route does not exist).
    uploadBrochure: async (file: File, slug: string): Promise<Course> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ data: Course }>(
            `/courses/${slug}/brochure`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data;
    },

    // Deleted by Cloudinary public id, which is also what lets the file itself be
    // removed rather than orphaned.
    deleteBrochure: async (slug: string, publicId: string): Promise<Course> => {
        const response = await apiClient.delete<{ data: Course }>(
            `/courses/${slug}/brochure/${publicId}`
        );
        return response.data.data;
    },

};