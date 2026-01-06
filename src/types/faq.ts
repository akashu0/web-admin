export interface FAQQuestion {
    question: string;
    answer: string;
    order: number;
}

export interface IFAQ {
    _id: string;
    entityType: 'University' | 'Course' | 'Country';
    title: string;
    status: 'active' | 'inactive' | 'draft';
    questions: FAQQuestion[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateFAQInput {
    entityType: 'University' | 'Course' | 'Country';
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

export interface FAQFilters {
    entityType?: 'University' | 'Course' | 'Country';
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
    };
    count?: number;
}