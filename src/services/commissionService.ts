import type { ListCommissionsParams } from '@/hooks/useCommissions';
import type {
    CommissionsResponse,
    PartnerCommission,
    CommissionFormValues,
} from '../types/commission';
import { apiClient } from './api';

const BASE = '/partner-commissions';

// ── List ──────────────────────────────────────────────────────────────────────

export const commissionService = {
    // The API answers with the shared envelope — { data, pagination } — so the
    // page/total the list needs live one level down, not on the body.
    getAll: async (params: ListCommissionsParams = {}): Promise<CommissionsResponse> => {
        const { data } = await apiClient.get<{
            data: PartnerCommission[];
            pagination?: { page: number; limit: number; total: number };
        }>(BASE, { params });
        const p = data.pagination;
        return {
            data: data.data ?? [],
            total: p?.total ?? data.data?.length ?? 0,
            page: p?.page ?? 1,
            limit: p?.limit ?? params.limit ?? 20,
        };
    },

    // The university editor's Commission tab. One record per university, so the
    // API upserts and the client never has to decide between create and update.
    // `audience` splits the agent card from the part-timer card — two records
    // per university at most, one per audience. Omitted = agent (the legacy rows).
    getForUniversity: async (slug: string, audience?: string): Promise<PartnerCommission | null> => {
        const { data } = await apiClient.get<{ data: PartnerCommission | null }>(
            `/universities/${slug}/commission`,
            { params: audience ? { audience } : undefined }
        );
        return data.data ?? null;
    },

    saveForUniversity: async (
        slug: string,
        payload: Partial<CommissionFormValues>,
        audience?: string
    ): Promise<PartnerCommission> => {
        const { data } = await apiClient.put<{ data: PartnerCommission }>(
            `/universities/${slug}/commission`,
            payload,
            { params: audience ? { audience } : undefined }
        );
        return data.data;
    },

    getById: async (id: string): Promise<PartnerCommission> => {
        const { data } = await apiClient.get<PartnerCommission>(`${BASE}/${id}`);
        return data;
    },

    create: async (payload: Partial<CommissionFormValues>): Promise<PartnerCommission> => {
        const { data } = await apiClient.post<PartnerCommission>(BASE, payload);
        return data;
    },

    update: async (
        id: string,
        payload: Partial<CommissionFormValues>
    ): Promise<PartnerCommission> => {
        const { data } = await apiClient.put<PartnerCommission>(`${BASE}/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<{ message: string; id: string }> => {
        const { data } = await apiClient.delete(`${BASE}/${id}`);
        return data;
    },

};