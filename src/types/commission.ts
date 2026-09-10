export interface TierRange {
    label?: string; // "" | undefined = flat rate | "1-5", "6-15" = tiered
    value: string;  // "600 EUR", "8.00%", "$800"
}

export interface CommissionTier {
    /** The standard rate — a self-funded placement. */
    ranges: TierRange[];
    /** The rate for fully-funded courses. Separate because they differ. */
    fundedRanges?: TierRange[];
    isFullyFunded?: boolean;
}

/**
 * Does this level carry anything worth showing?
 *
 * Either rate list counts, and so does the funded flag on its own: the imported
 * sheets use "fully funded, no figure" to mean "we place here, ask us". Callers
 * that tested `ranges.length` alone silently dropped both of those.
 */
export const tierIsPriced = (tier?: CommissionTier | null): boolean =>
    !!tier &&
    (!!tier.ranges?.length || !!tier.fundedRanges?.length || !!tier.isFullyFunded);

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
    fundedRanges: TierRangeForm[];
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

// ── Record → form ────────────────────────────────────────────────────────────
// Both editors (the standalone drawer and the university's Commission tab) fill
// the same form from the same record shape, so the conversion lives here.

const toRangeForms = (ranges: TierRange[] | null | undefined): TierRangeForm[] =>
    ranges?.map((r) => ({ label: r.label ?? "", value: r.value })) ?? [];

export const toTierForm = (tier: CommissionTier | null | undefined): CommissionTierForm => ({
    ranges: toRangeForms(tier?.ranges),
    fundedRanges: toRangeForms(tier?.fundedRanges),
    isFullyFunded: tier?.isFullyFunded ?? false,
});

export const toFormValues = (c: PartnerCommission): CommissionFormValues => ({
    universityRef: c.universityRef?._id ?? "",
    universityName: c.universityName,
    location: c.location ?? "",
    country: c.country ?? "",
    bachelors: toTierForm(c.bachelors),
    masters: toTierForm(c.masters),
    certifications_ps: toTierForm(c.certifications_ps),
    diploma_fopg: toTierForm(c.diploma_fopg),
    diploma: toTierForm(c.diploma),
    phd: toTierForm(c.phd),
    additionalBonus: c.additionalBonus ?? "",
    courseTypeRestrictions: c.courseTypeRestrictions ?? "",
    importantNotes: c.importantNotes ?? "",
    tuitionFees: c.tuitionFees ?? "",
    intakes: c.intakes ?? "",
});