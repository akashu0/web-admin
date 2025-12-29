// types/learningCenter.ts

import type { DynamicField } from "./course";


export interface FeeStructure {
    programTuitionFee: string;
    studentVisaFee: string;
    accommodation: string;
    airportTransfer: string;
    tax: string;
    applicationFee: string;
    dynamicFields: DynamicField[];
}

export interface ProgramDeliveryMode {
    modeType: "Express" | "Regular" | "Fast Track";
    durationYears: string;
    durationMonths: string;

    mode: string; // Online | Onsite | Hybrid
    support: string;
    feeStructure: FeeStructure;
    isActive: boolean;
}

export interface CreateLearningCenterDto {
    name: string;
    location: string;
    country: string;
    currency: string;
    programs: ProgramDeliveryMode[];
    isActive: boolean;
}

export interface LearningCenterResponse {
    id: string;
    _id: string;
    name: string;
    location: string;
    country: string;
    currency: string;
    programs: ProgramDeliveryMode[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LearningCenter {
    centerId: string;
    id: string;
    name: string;
    location: string;
    country: string;
    currency: string;
    programs: ProgramDeliveryMode[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}








export interface LearningCenterListResponse {
    success: boolean;
    message: string;
    data: LearningCenterResponse[];
}

export interface LearningCenterMutationResponse {
    success: boolean;
    message: string;
    data: LearningCenterResponse;
}