/**
 * Job openings awaiting publication.
 *
 * These are drafted in the CRM against an employer, and web-admin decides whether
 * they go live. The employer is CONFIDENTIAL and never reaches this app: the API
 * serves a redacted projection (internal/vacancies.PublicView), and this type is
 * written from that projection rather than from the stored record.
 *
 * That is deliberate. There is no `companyId`, no `companyName`, no contact and no
 * address here — so a component that tries to render the employer does not
 * compile, and a future API change that started sending it would be caught by the
 * type rather than shipped to a screen.
 *
 * Called a vacancy in the code because `eG Jobs` already means the student
 * placement pipeline in the CRM. The screens say "Jobs".
 */

import { toTierForm, type CommissionTierForm, type TierRange } from "./commission";

export type VacancyPublishStatus = "draft" | "published";

export interface VacancyPay {
  /** "range" | "exact" — decides which amounts mean anything. */
  showBy?: string;
  currency?: string;
  minAmount?: string;
  maxAmount?: string;
  exactAmount?: string;
  rate?: string;
}

export interface VacancyVisa {
  type?: string;
  duration?: string;
  /** "yes" | "no" | "" — empty means unanswered. */
  depends?: string;
}

export interface VacancyPackage {
  fees?: string;
  processingTime?: string;
}

export interface VacancyDocument {
  key?: string;
  label: string;
  required?: string;
}

export interface Vacancy {
  /**
   * Derived client-side from `vacancyId` so table rows have a stable key and the
   * selection survives paging. The API deliberately does not send an internal id.
   */
  id?: string;

  vacancyId: string;
  title: string;
  location?: string;
  city?: string;
  country?: string;
  hiringTimeline?: string;
  requiredCount?: number;
  jobType?: string;

  pay?: VacancyPay;
  visa?: VacancyVisa;
  package?: VacancyPackage;
  documents?: VacancyDocument[];

  /**
   * The "why this job" pitch, written in the CRM and shown on the public job
   * page. Read-only here: publishing decides WHETHER a job goes live, not what
   * it says — but the publisher has to be able to read the copy they are putting
   * out, which is why it is on this redacted view at all.
   *
   * `content` is plain text, not HTML.
   */
  whyChoose?: { heading?: string; content?: string };

  /**
   * The catalog FAQ shown with this opening — one id, never a list.
   *
   * A publishing decision rather than job content, so it is set from here and
   * not in the CRM. The questions themselves are fetched from /faqs; this is
   * only the link.
   */
  faqId?: string;

  publishStatus: VacancyPublishStatus;
  publishedAt?: string;
  updatedAt?: string;
}

export interface VacancyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VacancyPublishStatus;
  country?: string;
  jobType?: string;
  sort?: string;
  dir?: "asc" | "desc";
}

export interface VacancyFacets {
  country?: string[];
  jobType?: string[];
  city?: string[];
}

export const PUBLISH_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
] as const;

/* ----------------------------- Incentive cards ---------------------------- */

/**
 * Who earns a rate card. The screens say B2C and B2B; the API says agent and
 * parttimer, the same split the university tabs use.
 */
export type CommissionAudience = "agent" | "parttimer";

export const AUDIENCE_LABELS: Record<CommissionAudience, string> = {
  agent: "B2C",
  parttimer: "B2B",
};

/**
 * What eG earns on one job, for one audience.
 *
 * FLAT, unlike the university card: a job has no course levels to price. Where a
 * job needs tiering it goes on each range's `label` — blank for a flat rate,
 * "1-5" / "6-15" to tier by how many candidates were placed.
 *
 * `fundedRanges` and `isFullyFunded` keep the university's words because they
 * mean the same thing — there is a second rate for the fully-funded variant —
 * and keeping them lets the existing tier editor render this card unchanged.
 *
 * No employer and no internal ids: the API sends neither, and there is no field
 * here for them to land in.
 */
export interface VacancyCommission {
  vacancyRef: string;
  audience?: CommissionAudience;

  ranges?: TierRange[];
  fundedRanges?: TierRange[];
  isFullyFunded?: boolean;

  additionalBonus?: string;
  importantNotes?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * The editor's state.
 *
 * The three rate fields are nested under `tier` so the whole group can be handed
 * to the existing CommissionTierField as one value/onChange pair. The card the
 * API stores is flat, so the service flattens on the way out — in one place,
 * rather than in the component.
 */
export interface VacancyCommissionFormValues {
  tier: CommissionTierForm;
  additionalBonus: string;
  importantNotes: string;
}

export const emptyCommissionForm = (): VacancyCommissionFormValues => ({
  tier: { ranges: [], fundedRanges: [], isFullyFunded: false },
  additionalBonus: "",
  importantNotes: "",
});

export const toCommissionFormValues = (
  c: VacancyCommission,
): VacancyCommissionFormValues => ({
  // The university's own converter fills the tier half, so there is no second
  // copy of that logic. `ranges` is spelled out because the API omits an empty
  // list entirely, where CommissionTier requires the key to be present.
  tier: toTierForm({
    ranges: c.ranges ?? [],
    fundedRanges: c.fundedRanges,
    isFullyFunded: c.isFullyFunded,
  }),
  additionalBonus: c.additionalBonus ?? "",
  importantNotes: c.importantNotes ?? "",
});
