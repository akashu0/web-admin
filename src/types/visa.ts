// types/visa.ts

export interface VisaDocument {
    id: string;
    name: string;
    description?: string;
    isMandatory: boolean;
}

export interface VisaStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    estimatedDays?: number;
}

export interface VisaRenewalDocument {
    id: string;
    name: string;
    description?: string;
    isMandatory: boolean;
}

export interface Visa {
    _id: string;
    id: string;
    country: string;
    visaDocuments: VisaDocument[];
    visaFee: string;
    currency: string;
    visaSteps: VisaStep[];
    visaRenewalCost: string;
    renewalDocuments: VisaRenewalDocument[];
    visaSuccessRate: string; // Percentage (0-100)
    visaProcessingTime: string; // In days
    visaProcessingTimeUnit: 'days' | 'weeks' | 'months';
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface CreateVisaDto {
    country: string;
    visaDocuments: Omit<VisaDocument, 'id'>[];
    visaFee: string;
    currency?: string;
    visaSteps: Omit<VisaStep, 'id'>[];
    visaRenewalCost: string;
    renewalDocuments: Omit<VisaRenewalDocument, 'id'>[];
    visaSuccessRate: string;
    visaProcessingTime: string;
    visaProcessingTimeUnit?: 'days' | 'weeks' | 'months';
    status?: 'active' | 'inactive';
}

export interface UpdateVisaDto extends Partial<CreateVisaDto> { }

export interface VisaListResponse {
    success: boolean;
    data: Visa[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface SingleVisaResponse {
    success: boolean;
    data: Visa;
}

export interface VisaMutationResponse {
    success: boolean;
    message: string;
    data: Visa;
}

export interface VisaQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}