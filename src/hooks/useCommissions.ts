import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionService } from '../services/commissionService';
import type { CommissionFormValues } from '../types/commission';

export interface ListCommissionsParams {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const commissionKeys = {
    all: ['commissions'] as const,
    list: (params: ListCommissionsParams) => ['commissions', 'list', params] as const,
    detail: (id: string) => ['commissions', 'detail', id] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const useCommissions = (params: ListCommissionsParams = {}) =>
    useQuery({
        queryKey: commissionKeys.list(params),
        queryFn: () => commissionService.getAll(params),
    });

export const useCommission = (id: string | null) =>
    useQuery({
        queryKey: commissionKeys.detail(id ?? ''),
        queryFn: () => commissionService.getById(id!),
        enabled: Boolean(id),
    });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateCommission = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<CommissionFormValues>) =>
            commissionService.create(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: commissionKeys.all }),
    });
};

export const useUpdateCommission = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CommissionFormValues> }) =>
            commissionService.update(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: commissionKeys.all });
            qc.invalidateQueries({ queryKey: commissionKeys.detail(id) });
        },
    });
};

export const useDeleteCommission = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => commissionService.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: commissionKeys.all }),
    });
};

export const useBulkUpload = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (records: unknown[]) => commissionService.bulkUpload(records),
        onSuccess: () => qc.invalidateQueries({ queryKey: commissionKeys.all }),
    });
};