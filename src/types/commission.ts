export interface TierRange {
    label?: string; // "" | undefined = flat rate | "1-5", "6-15" = tiered
    value: string;  // "600 EUR", "8.00%", "$800"
}

export interface CommissionTier {
    ranges: TierRange[];
    isFullyFunded?: boolean;
}

export type CourseType =
    | "bachelors"
    | "masters"
    | "certifications_ps"
    | "diploma_fopg"
    | "diploma"
    | "phd";

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
    bachelors: "Bachelors",
    masters: "Masters",
    certifications_ps: "Cert / PS",
    diploma_fopg: "Diploma / FO",
    diploma: "PG Diploma",
    phd: "PhD",
};

export const COURSE_TYPES: CourseType[] = [
    "bachelors",
    "masters",
    "certifications_ps",
    "diploma_fopg",
    "diploma",
    "phd",
];

export interface UniversityRef {
    _id: string;
    name: string;
    logo?: string;
    country?: string;
}

export interface PartnerCommission {
    _id: string;
    universityRef?: UniversityRef | null;
    universityName: string;
    location?: string;
    country?: string;
    bachelors?: CommissionTier | null;
    masters?: CommissionTier | null;
    certifications_ps?: CommissionTier | null;
    diploma_fopg?: CommissionTier | null;
    diploma?: CommissionTier | null;
    phd?: CommissionTier | null;
    additionalBonus?: string;
    courseTypeRestrictions?: string;
    importantNotes?: string;
    tuitionFees?: string;
    intakes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommissionsResponse {
    data: PartnerCommission[];
    total: number;
    page: number;
    limit: number;
}

// ── Form shape (for create / edit) ───────────────────────────────────────────

export interface TierRangeForm {
    label: string;
    value: string;
}

export interface CommissionTierForm {
    ranges: TierRangeForm[];
    isFullyFunded: boolean;
}

export interface CommissionFormValues {
    universityRef: string;
    universityName: string;
    location: string;
    country: string;
    bachelors: CommissionTierForm;
    masters: CommissionTierForm;
    certifications_ps: CommissionTierForm;
    diploma_fopg: CommissionTierForm;
    diploma: CommissionTierForm;
    phd: CommissionTierForm;
    additionalBonus: string;
    courseTypeRestrictions: string;
    importantNotes: string;
    tuitionFees: string;
    intakes: string;
}