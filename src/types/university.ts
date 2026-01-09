// src/types/university.ts

/**
 * Fee Structure (embedded in University)
 */
export interface FeeStructure {
    level: "undergraduate" | "postgraduate";
    currency: string; // e.g., "USD", "EUR", "GBP"
    tuitionFee: string; // e.g., "15000 - 20000"
    applicationFee?: string;
    duration?: string; // e.g., "4 years"
}

/**
 * Student Life section
 */
export interface StudentLifeStats {
    studentOrganizations?: string; // e.g., "500+"
    varsitySports?: string; // e.g., "33"
    studentFacultyRatio?: string; // e.g., "12:1"
}

export interface StudentLifeAthletics {
    division?: string; // e.g., "Division III"
}

export interface StudentLife {
    overview?: string;
    stats?: StudentLifeStats;
    athletics?: StudentLifeAthletics;
}

/**
 * Admissions - Undergraduate
 */
export interface UndergraduateAdmissions {
    acceptanceRate?: string;
    sat?: string;
    act?: string;
    toefl?: string;
    ielts?: string;
    requirements?: string[];
}

/**
 * Admissions - Postgraduate
 */
export interface PostgraduateAdmissions {
    acceptanceRate?: string;
    gre?: string;
    gpa?: string;
    toefl?: string;
    ielts?: string;
    requirements?: string[];
}

/**
 * Admissions - PhD
 */
export interface PhdAdmissions {
    gre?: string;
    gpa?: string;
    researchProposalRequired?: boolean;
    requirements?: string[];
}

/**
 * Full Admissions object (array of references in schema, but often populated)
 */
export interface Admissions {
    undergraduate?: {
        acceptanceRate?: string;
        sat?: string;
        act?: string;
        toefl?: string;
        ielts?: string;
        requirements?: string[];
    };
    postgraduate?: {
        acceptanceRate?: string;
        gre?: string;
        gpa?: string;
        toefl?: string;
        ielts?: string;
        requirements?: string[];
    };
    phd?: {
        gre?: string;
        gpa?: string;
        researchProposalRequired?: boolean;
        requirements?: string[];
    };
}

/**
 * Main University Type (matches IUniversity interface + Document)
 */
export interface University {
    _id: string;
    name: string;
    fullName: string;
    country: string;
    city: string;
    location: string;
    founded: string;
    totalStudents: string;
    internationalStudents: string;
    rank: string;
    about: string;

    // Images
    logoUrl?: string;
    bannerUrl?: string;
    galleryUrls: string[];

    // Embedded
    fees?: FeeStructure[];

    // Populated or raw IDs (depending on query)
    admissions?: Admissions;
    studentLife?: StudentLife;
    faqs: string[]; // Array of FAQ ObjectIds (as strings)
    courses: string[]; // Array of Course ObjectIds (as strings)

    // Status & Slug
    status: "published" | "draft";
    slug: string;

    // Timestamps
    createdAt: string; // ISO string
    updatedAt: string; // ISO string

    // Optional virtuals or methods (if you add any later)
    [key: string]: any;
}


export interface UniversityListResponse {
    success: boolean;
    data: University[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface UniversityResponse {
    success: boolean;
    data: University;
    message?: string;
}

/**
 * Pagination Meta (commonly used in list responses)
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Query Params for fetching universities
 */
export interface UniversityQueryParams {
    page?: number;
    limit?: number;
    status?: "all" | "published" | "draft";
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    country?: string;
    city?: string;
}