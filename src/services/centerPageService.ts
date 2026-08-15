import { apiClient } from "./api";
import type { CenterPage, CenterPageQueryParams } from "@/types/centerPage";

interface ListResponse {
  success: boolean;
  data: CenterPage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * The eG Academy centre landing pages.
 *
 * `saveSection` is the only write an editor makes: the API's generic PATCH sets
 * exactly the keys it is given, so sending `{ hero: {...} }` replaces the hero
 * and touches nothing else. That is what makes nine independent section forms
 * safe on one document — no read-modify-write of the whole page, so two people
 * editing two sections cannot overwrite each other.
 */
export const centerPageService = {
  async getAll(params?: CenterPageQueryParams): Promise<ListResponse> {
    const res = await apiClient.get<ListResponse>("/center-pages", { params });
    return res.data;
  },

  async getBySlug(slug: string): Promise<CenterPage> {
    const res = await apiClient.get<{ success: boolean; data: CenterPage }>(
      `/center-pages/${slug}`,
    );
    return res.data.data;
  },

  async create(payload: {
    name: string;
    slug?: string;
    country?: string;
    order?: number;
  }): Promise<CenterPage> {
    const res = await apiClient.post<{ success: boolean; data: CenterPage }>(
      "/center-pages",
      payload,
    );
    return res.data.data;
  },

  async saveSection(slug: string, section: Partial<CenterPage>): Promise<CenterPage> {
    const res = await apiClient.patch<{ success: boolean; data: CenterPage }>(
      `/center-pages/${slug}`,
      section,
    );
    return res.data.data;
  },

  async updateStatus(slug: string, status: "draft" | "published"): Promise<CenterPage> {
    const res = await apiClient.patch<{ success: boolean; data: CenterPage }>(
      `/center-pages/${slug}/status`,
      { status },
    );
    return res.data.data;
  },

  async remove(slug: string): Promise<void> {
    await apiClient.delete(`/center-pages/${slug}`);
  },

  /**
   * Upload an image and get back its URL, for the hero and section photographs.
   *
   * The centre-page routes take JSON only — an image here is a URL on the
   * document, and several of the live ones are external. So the file goes to the
   * shared media endpoint first and the editor stores what it answers.
   */
  async uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "center-pages");
    const res = await apiClient.post<{
      success: boolean;
      data: { files: { url: string }[]; failed: number };
    }>("/media/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
    const url = res.data.data?.files?.[0]?.url;
    if (!url) throw new Error("The upload did not return a file");
    return url;
  },
};
