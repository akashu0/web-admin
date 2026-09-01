import type { SortParams } from '@/services/api';
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
    // No applicationFee or duration: both were removed from the Go model.
    // Duration belongs to the COURSE, which states it already; the application
    // fee was the same figure repeated on every band.
}

/**
 * Student Life section — prose about campus life, and only that.
 *
 * The `stats` block and `athletics.division` were removed here and in the Go
 * model: four American-campus figures nobody filled in, which rendered as an
 * empty stat grid wherever they were shown.
 */
export interface StudentLife {
    overview?: string;
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

    feeRange?: string;

    // Images. `logo`/`banner` — NOT logoUrl/bannerUrl, which is what this file
    // used to claim; every read of them was silently undefined.
    logo?: string;
    banner?: string;
    galleryUrls: string[];
    youtubeVideoUrl?: string;

    // Embedded
    fees?: FeeStructure[];

    // Populated or raw IDs (depending on query)
    admissions?: Admissions;
    studentLife?: StudentLife;
    whyChoose?: { heading?: string; content?: string };
    reviews?: UniversityReview[];
    visa?: string;  // one Visa ObjectId
    faqs?: string;  // one FAQ ObjectId — a single id, never a list
    courses: string[]; // Array of Course ObjectIds (as strings)

    // Status & Slug
    status: "published" | "draft";
    slug: string;

    // Timestamps
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    viewCount?: number;
    courseCount?: number;
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
export interface UniversityQueryParams extends SortParams {
    page?: number;
    limit?: number;
    status?: "all" | "published" | "draft";
    search?: string;
    country?: string;
    city?: string;
    location?: string;
    continent?: string;
    streams?: string;
    universityType?: "Public" | "Private";
}

/** The values universities actually carry — what the filter bar may offer. */
export interface UniversityFacets {
    countries: string[];
    continents: string[];
    cities: string[];
    universityTypes: string[];
    streams: string[];
}