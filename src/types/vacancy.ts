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
