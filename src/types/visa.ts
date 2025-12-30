// types/visa.ts

export interface VisaDocument {
    _id?: string;
    name: string;
    description?: string;
    isMandatory: boolean;
}

export interface VisaStep {
    _id?: string;
    stepNumber: number;
    title: string;
    description: string;
    estimatedDays?: number;
}

export interface VisaRenewalDocument {
    _id?: string;
    name: string;
    description?: string;
    isMandatory: boolean;
}

export interface Visa {
    _id: string;
    country: string;
    visaDocuments: VisaDocument[];
    visaFee: string;
    currency: string;
    visaSteps: VisaStep[];
    visaRenewalCost: string;
    renewalDocuments: VisaRenewalDocument[];
    visaSuccessRate: string;
    visaProcessingTime: string;
    visaProcessingTimeUnit: 'days' | 'weeks' | 'months';
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

// Changed: Allow optional _id in nested documents for both create and update
export interface CreateVisaDto {
    country: string;
    visaDocuments: VisaDocument[]; // Now includes optional _id
    visaFee: string;
    currency?: string;
    visaSteps: VisaStep[]; // Now includes optional _id
    visaRenewalCost: string;
    renewalDocuments: VisaRenewalDocument[]; // Now includes optional _id
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