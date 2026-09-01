import type { SortParams } from '@/services/api';

/**
 * What a FAQ can be attached to.
 *
 * One exported list rather than the same union written out in each interface:
 * adding `Job` meant editing it in six places across three files, and the
 * dropdowns that offer it are driven from here so they cannot fall out of step
 * with the type again.
 *
 * The API does not police these — `FAQ.EntityType` is a plain string on the Go
 * model — so this list IS the contract.
 */
export const FAQ_ENTITY_TYPES = ['University', 'Course', 'Country', 'Job'] as const;

export type FAQEntityType = (typeof FAQ_ENTITY_TYPES)[number];
export interface FAQQuestion {
    question: string;
    answer: string;
    order: number;
}

export interface IFAQ {
    _id: string;
    entityType: FAQEntityType;
    title: string;
    status: 'active' | 'inactive' | 'draft';
    questions: FAQQuestion[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateFAQInput {
    entityType: FAQEntityType;
    title: string;
    status?: 'active' | 'inactive' | 'draft';
    questions: Array<{
        question: string;
        answer: string;
        order: number;
    }>;
}

export interface UpdateFAQInput {
    title?: string;
    status?: 'active' | 'inactive' | 'draft';
    questions?: Array<{
        question: string;
        answer: string;
        order: number;
    }>;
}

export interface FAQFilters extends SortParams {
    entityType?: FAQEntityType;
    status?: 'active' | 'inactive' | 'draft';
    page?: number;
    limit?: number;
}

export interface PaginationResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage?: boolean;
        hasPrevPage?: boolean;
    };
    count?: number;
}