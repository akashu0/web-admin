import { apiClient } from "./api";
import type {
  Vacancy,
  VacancyFacets,
  VacancyPublishStatus,
  VacancyQueryParams,
} from "@/types/vacancy";

/**
 * The job publishing queue.
 *
 * Deliberately hits `/vacancies/review`, not the CRM's `/vacancies` — the review
 * routes return a REDACTED projection with no employer on it. Pointing this
 * service at the CRM's own routes would be the one change that could leak a
 * company into web-admin, which is why the paths are spelled out here rather than
 * built from a shared base.
 */

/** The envelope every list endpoint returns; callers need `pagination`. */
interface Envelope<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
}

/**
 * The API sends no internal id — the public reference is the only identifier
 * these surfaces get. `id` is filled in from it so table rows have a stable key
 * and a selection survives an infinite-scroll append.
 */
const withKey = (v: Vacancy): Vacancy => ({ ...v, id: v.vacancyId });

export const vacancyService = {
  list: async (params: VacancyQueryParams = {}) => {
    const response = await apiClient.get<Envelope<Vacancy[]>>("/vacancies/review", {
      params,
    });
    return {
      ...response.data,
      data: (response.data.data ?? []).map(withKey),
    };
  },

  getOne: async (vacancyId: string) => {
    const response = await apiClient.get<Envelope<Vacancy>>(
      `/vacancies/review/${vacancyId}`,
    );
    return withKey(response.data.data);
  },

  facets: async (fields = "country,jobType,city") => {
    const response = await apiClient.get<Envelope<VacancyFacets>>(
      "/vacancies/review/facets",
      { params: { fields } },
    );
    return response.data.data ?? {};
  },

  /**
   * Publish or unpublish, one row or a selection.
   *
   * Takes the public references, not internal ids — that is all this app holds.
   * One updateMany on the server, so flipping the status never trips validation
   * on a field the publisher was not editing.
   */
  bulkUpdateStatus: async (vacancyIds: string[], status: VacancyPublishStatus) => {
    const response = await apiClient.patch("/vacancies/bulk/status", {
      vacancyIds,
      status,
    });
    return response.data;
  },

  /**
   * Attach a catalog FAQ to a job, or clear it with an empty string.
   *
   * Its own endpoint, not part of any job-content save: the CRM owns what the
   * opening SAYS, this app owns how it reads once published. Returns the
   * redacted job, so the caller can render what the server now holds.
   */
  setFaq: async (vacancyId: string, faqId: string) => {
    const response = await apiClient.patch<Envelope<Vacancy>>(
      `/vacancies/review/${vacancyId}/faq`,
      { faqId },
    );
    return withKey(response.data.data);
  },
};
