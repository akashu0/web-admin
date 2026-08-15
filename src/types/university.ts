// src/types/university.ts

/**
 * Fee Structure (embedded in University)
 */
export interface FeeStructure {
    level: string;
    currency: string; // e.g., "USD", "EUR", "GBP"
    tuitionFee: string; // e.g., "15000 - 20000"
    // Written by the Fees tab and carried by the imported records; it was missing
    // here, so anything reading a fee row had to cast.
    tuitionFeeType?: "Fully Tuition Fee Funded" | "Scholarships" | "Regular (Self-Funded Program)";
    scholarshipPercentage?: string;
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
 * Student Review (embedded in University)
 */
export interface UniversityReview {
    _id?: string;
    studentName: string;
    rating: number; // 1 - 5
    comment: string;
    course?: string;
    date?: string;
}

/**
 * Admissions.
 *
 * A flat map of requirement -> { required, details } plus free-form extras —
 * which is what the API stores and what the editor writes. It replaced a
 * level-keyed shape (undergraduate/postgraduate/phd) that no record has carried
 * since the Go cutover; the old view modal still rendered that shape, which is
 * why it always showed an empty Admissions tab.
 */
export interface AdmissionEntry {
    required?: boolean;
    details?: string;
}

export interface CustomRequirement {
    name: string;
    details?: string;
}

export type Admissions = Partial<Record<string, AdmissionEntry>> & {
    customRequirements?: CustomRequirement[];
};

/**
 * Main University Type (matches IUniversity interface + Document)
 */
export interface University {
    _id: string;
    name: string;
    fullName: string;
    country: string;
    city: string;
    continent?: string;
    universityType?: 'Public' | 'Private';
    location: string;
    founded: string;
    totalStudents: string;
    internationalStudents: string;
    rank: string;
    about: string;
    streams?: string[];

    // Images
    logoUrl?: string;
    bannerUrl?: string;
    galleryUrls: string[];

    // Embedded
    fees?: FeeStructure[];

    // Populated or raw IDs (depending on query)
    admissions?: Admissions;
    studentLife?: StudentLife;
    reviews?: UniversityReview[];
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
    // No sortBy/sortOrder: the API sorts every list by _id and reads neither.
    country?: string;
    city?: string;
    location?: string;
    continent?: string;
    streams?: string;
    universityType?: "all" | "Public" | "Private";
}

/** The values universities actually carry — what the filter bar may offer. */
export interface UniversityFacets {
    countries: string[];
    continents: string[];
    cities: string[];
    universityTypes: string[];
    streams: string[];
}