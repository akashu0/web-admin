import type { CreateFAQInput, FAQFilters, IFAQ, PaginationResponse, UpdateFAQInput } from "@/types/faq";
import { apiClient } from "./api";


class FAQService {
    // private getAuthHeader() {
    //     const token = localStorage.getItem('token');
    //     return {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     };
    // }

    // Get all FAQs with filters
    async getAllFAQs(filters?: FAQFilters): Promise<PaginationResponse<IFAQ[]>> {
        const params = new URLSearchParams();
        if (filters?.entityType) params.append('entityType', filters.entityType);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.sort) {
            params.append('sort', filters.sort);
            params.append('dir', filters.dir ?? 'asc');
        }

        const response = await apiClient.get(`/faqs?${params.toString()}`);
        return response.data;
    }

    // Get all FAQs with filters
    async getFAQDropdown(): Promise<PaginationResponse<IFAQ[]>> {
        const response = await apiClient.get(
            `/faqs?limit=200`,
        );
        return response.data;
    }

    // Create FAQ
    async createFAQ(
        data: CreateFAQInput
    ): Promise<{ success: boolean; message: string; data: IFAQ }> {
        const response = await apiClient.post(
            `/faqs`,
            data,
        );
        return response.data;
    }

    // Update FAQ
    async updateFAQ(
        id: string,
        data: UpdateFAQInput
    ): Promise<{ success: boolean; message: string; data: IFAQ }> {
        // PATCH, not PUT: this form sends only {title, status, questions}, and a
        // whole-document replace erased entityType/entityId — which dropped the
        // FAQ out of every filtered list it belonged to.
        const response = await apiClient.patch(
            `/faqs/${id}`,
            data,
        );
        return response.data;
    }

    // Delete FAQ
    async deleteFAQ(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete(
            `/faqs/${id}`,
        );
        return response.data;
    }

    // Bulk delete.
    //
    // The API has no bulk endpoint for FAQs and does not need one — there are a
    // handful of documents, and fanning the per-record DELETE out concurrently is
    // one round trip in wall-clock terms. Promise.all rejects on the first
    // failure, which is what the caller's error toast expects.
    async bulkDeleteFAQs(
        faqIds: string[]
    ): Promise<{ success: boolean; message: string; data: { deletedCount: number } }> {
        await Promise.all(faqIds.map((id) => this.deleteFAQ(id)));
        return {
            success: true,
            message: `${faqIds.length} FAQs deleted`,
            data: { deletedCount: faqIds.length },
        };
    }

    // Bulk status, same shape: one PATCH per record.
    async bulkUpdateStatus(
        faqIds: string[],
        status: 'active' | 'inactive' | 'draft'
    ): Promise<{ success: boolean; message: string }> {
        await Promise.all(
            faqIds.map((id) => apiClient.patch(`/faqs/${id}/status`, { status }))
        );
        return { success: true, message: `${faqIds.length} FAQs updated` };
    }
}

export const faqService = new FAQService();