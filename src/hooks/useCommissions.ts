import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionService } from '../services/commissionService';
import type { CommissionFormValues } from '../types/commission';
import type { SortParams } from '../services/api';

export interface ListCommissionsParams extends SortParams {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
}

export type ListCommissionsInfiniteParams = Omit<ListCommissionsParams, 'page'>;

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

// Infinite-scroll variant of the list query: fetches pages sequentially and
// accumulates them, deriving `hasNextPage` from the response's own
// `page`/`limit`/`total` fields (the API doesn't return a `hasNextPage` flag).
export const useInfiniteCommissions = (params: ListCommissionsInfiniteParams = {}) =>
    useInfiniteQuery({
        queryKey: ['commissions', 'infinite-list', params],
        queryFn: ({ pageParam }) => commissionService.getAll({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const limit = lastPage.limit || params.limit || 20;
            return lastPage.page * limit < lastPage.total ? lastPage.page + 1 : undefined;
        },
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
