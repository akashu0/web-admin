import type { FeeStructure, University, UniversityFacets, UniversityListResponse, UniversityQueryParams, UniversityResponse } from '../types/university';
import { apiClient } from './api';

export const universityService = {
    getAllUniversities: async (params: UniversityQueryParams): Promise<UniversityListResponse> => {
        const response = await apiClient.get<UniversityListResponse>(`/universities`, {
            params,
        });
        return response.data;
    },

    // Narrowed by country, so picking one shrinks the city list to its cities.
    getFacets: async (country?: string, status?: string): Promise<UniversityFacets> => {
        const response = await apiClient.get<{ data: UniversityFacets }>(`/universities/facets`, {
            params: { country: country || undefined, status: status || undefined },
        });
        return response.data.data;
    },
    createUniversity: async (data: FormData): Promise<UniversityResponse> => {
        const response = await apiClient.post<UniversityResponse>(
            `/universities`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Delete university
    deleteUniversity: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/universities/${id}`);
        return response.data;
    },

    // The signed, short-lived URL that opens an UNPUBLISHED university on the
    // public site. Minted by the API — the preview secret must not be in this
    // bundle, where anyone could read it and with it every draft.
    // 501 when the environment has no preview configured.
    getPreviewLink: async (slug: string): Promise<{ url: string }> => {
        const response = await apiClient.get<{ data: { url: string } }>(
            `/universities/${slug}/preview-link`
        );
        return response.data.data;
    },

    // Get university by slug
    getUniversityBySlug: async (slug: string): Promise<UniversityResponse> => {
        const response = await apiClient.get<UniversityResponse>(`/universities/${slug}`);
        return response.data;
    },

    /**
     * The universities behind a course's `universityIds` list.
     *
     * By id rather than filtering a list, because the list endpoint clamps
     * `limit` to 100 server-side and a university past that would silently come
     * back missing. `/universities/{key}` takes an id or a slug.
     */
    getByIds: async (ids: string[]): Promise<University[]> => {
        const wanted = ids.filter(Boolean);
        if (!wanted.length) return [];

        const settled = await Promise.all(
            wanted.map(async (id) => {
                try {
                    const res = await apiClient.get<UniversityResponse>(`/universities/${id}`);
                    return res.data?.data ?? null;
                } catch {
                    // A deleted university is a gap, not a failed page — the
                    // course still has to render.
                    return null;
                }
            }),
        );
        return settled.filter((u): u is University => !!u);
    },

    // Update Basic Information
    updateBasicInfo: async (slug: string, data: any) => {
        const response = await apiClient.patch(`/universities/${slug}/section/basic-info`, data);
        return response.data;
    },

    // Update Fee Structure.
    //
    // The body IS the section, so this takes the fee LIST. The array-vs-object
    // split across these four is not arbitrary — it mirrors the model:
    // `Fees []FeeStructure` and `Reviews []Review` against `Admissions
    // *Admissions` and `StudentLife *StudentLife`. Typed rather than `any`
    // because sending the wrapper object instead of the array is what made
    // every read of a saved university fail to decode.
    updateFees: async (slug: string, fees: FeeStructure[]) => {
        const response = await apiClient.patch(`/universities/${slug}/section/fees`, fees);
        return response.data;
    },

    // Update Admissions
    updateAdmissions: async (slug: string, data: any) => {
        const response = await apiClient.patch(`/universities/${slug}/section/admissions`, data);
        return response.data;
    },

    // Update Student Life
    updateStudentLife: async (slug: string, data: any) => {
        const response = await apiClient.patch(`/universities/${slug}/section/student-life`, data);
        return response.data;
    },

    // Update the USP block. An OBJECT section (like admissions/student-life),
    // NOT a list — it is keyed in universitySections but deliberately absent
    // from universityListSections on the Go side.
    updateWhyChoose: async (slug: string, data: { heading?: string; content?: string }) => {
        const response = await apiClient.patch(`/universities/${slug}/section/why-choose`, data);
        return response.data;
    },

    // Update Student Reviews — the review LIST, see updateFees.
    updateReviews: async (slug: string, reviews: unknown[]) => {
        const response = await apiClient.patch(`/universities/${slug}/section/reviews`, reviews);
        return response.data;
    },

    // Update Images (with FormData for file uploads)
    updateImages: async (slug: string, data: FormData) => {
        const response = await apiClient.patch(`/universities/${slug}/images`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // Update Media (YouTube video link)
    updateMedia: async (slug: string, data: any) => {
        const response = await apiClient.patch(`/universities/${slug}/section/media`, data);
        return response.data;
    },

    // Update Refrences
    updateReferences: async (slug: string, data: any) => {
        const response = await apiClient.patch(`/universities/${slug}/section/references`, data);
        return response.data;
    },

    // Bulk (or single) status change. Hits updateMany on the backend with no
    // document validation, so switching draft<->published never trips the
    // required-field validation of the full editor (basic-info) path.
    bulkUpdateStatus: async (
        universityIds: string[],
        status: "published" | "draft"
    ) => {
        const response = await apiClient.patch(`/universities/bulk/status`, {
            universityIds,
            status,
        });
        return response.data;
    },
};
