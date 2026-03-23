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
    getAll: async (params: ListCommissionsParams = {}): Promise<CommissionsResponse> => {
        const { data } = await apiClient.get<CommissionsResponse>(BASE, { params });
        return data;
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

    bulkUpload: async (records: unknown[]): Promise<{
        message: string;
        total: number;
        upserted: number;
        modified: number;
        matched: number;
    }> => {
        const { data } = await apiClient.post(`${BASE}/bulk`, { records });
        return data;
    },

    bulkUploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await apiClient.post(`${BASE}/bulk/file`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};