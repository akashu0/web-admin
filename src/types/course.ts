import type { LearningCenter } from "./learningCenter";

// types/course.ts
export type DynamicFieldType = 'text' | 'textarea' | 'dropdown' | 'radio';

export type FieldType = 'text' | 'richtext' | 'media' | 'number' | 'boolean' | 'dropdown';

export interface DynamicField {
    label: string;
    id?: string;
    fieldName: string;
    fieldValue: any;
    fieldType: FieldType;
    options?: string[];
    order: number;
}

export interface CourseOverview {
    _id?: string;
    courseName: string;
    headingDescription: string;
    slug: string;
    description: string;
    durationYears?: number;
    durationMonths?: number;
    studyModeType: 'fast-track' | 'regular';
    studyMode: 'online' | 'offline' | 'hybrid';
    awardedBy: string;
    nextIntake: string;
    level: string;
    courseImage?: File | string | null;
    dynamicFields?: DynamicField[];
}

export interface DocumentRequired {
    id: string;
    documentName: string;
    description: string;
    isMandatory: boolean;
}

export interface VisaProcess {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
}

export interface CareerOpportunity {
    id: string;
    title: string;
    description: string;
    averageSalary?: string;
}



export interface Brochure {
    fileName?: string;
    title?: string;
    description?: string;
    fileUrl?: string;
    fileSize?: number;
}


export interface CourseFormData {
    _id?: string;
    overview: CourseOverview;
    studyCenters?: LearningCenter[];
    documentsRequired: DocumentRequired[];
    visaProcess: VisaProcess[];
    careerOpportunities: CareerOpportunity[];
    brochure: Brochure[];
    dynamicFields?: DynamicField[];
    status: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface PaginationMeta {
    hasPrevPage: boolean;
    hasNextPage: boolean;
    totalPages: number;
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface Course {
    studyCenters: never[];
    dynamicFields: never[];
    brochure: never[];
    overview: CourseOverview;
    careerOpportunities: never[];
    visaProcess: never[];
    documentsRequired: never[];
    _id: string;
    courseName: string;
    slug: string;
    courseImage?: string;
    description?: string;
    level?: string;
    durationYears?: number;
    durationMonths?: number;
    studyModeType: 'fast-track' | 'regular';
    studyMode: 'online' | 'offline' | 'hybrid';
    nextIntake: string;
    awardedBy?: string;
    status: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

export type CourseSection =
    | 'overview'
    | 'studyCenters'
    | 'documents'
    | 'visa'
    | 'career'
    | 'brochure'
    | 'dynamicFields';

export interface CourseQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'draft' | 'published';
    level?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CourseListResponse {
    success: boolean;
    message: string;
    data: Course[];
    pagination: PaginationMeta;
}