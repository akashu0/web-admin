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

        const response = await apiClient.get(
            `/faqs/get-all-faqs?${params.toString()}`,
        );
        return response.data;
    }

    // Get all FAQs with filters
    async getFAQDropdown(): Promise<PaginationResponse<IFAQ[]>> {
        const response = await apiClient.get(
            `/faqs/get-all-faqs-dropdown`,
        );
        return response.data;
    }

    // Get FAQ by ID
    async getFAQById(id: string): Promise<{ success: boolean; data: IFAQ }> {
        const response = await apiClient.get(
            `/faqs/get-faq/${id}`,
        );
        return response.data;
    }

    // Get FAQs by entity
    async getFAQsByEntity(
        entityType: string,
    ): Promise<PaginationResponse<IFAQ[]>> {
        const response = await apiClient.get(
            `/faqs/get-faq/${entityType}`,
        );
        return response.data;
    }

    // Create FAQ
    async createFAQ(
        data: CreateFAQInput
    ): Promise<{ success: boolean; message: string; data: IFAQ }> {
        const response = await apiClient.post(
            `/faqs/create-faq`,
            data,
        );
        return response.data;
    }

    // Update FAQ
    async updateFAQ(
        id: string,
        data: UpdateFAQInput
    ): Promise<{ success: boolean; message: string; data: IFAQ }> {
        const response = await apiClient.put(
            `/faqs/update-faq/${id}`,
            data,
        );
        return response.data;
    }

    // Delete FAQ
    async deleteFAQ(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete(
            `/faqs/delete-faq/${id}`,
        );
        return response.data;
    }

    // Bulk delete FAQs
    async bulkDeleteFAQs(
        faqIds: string[]
    ): Promise<{ success: boolean; message: string; data: { deletedCount: number } }> {
        const response = await apiClient.post(
            `/faqs/bulk-delete`,
            { faqIds },
        );
        return response.data;
    }

    // Update FAQ order
    async updateFAQOrder(
        faqs: Array<{ id: string; order: number }>
    ): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.patch(
            `/faqs/reorder`,
            { faqs },
        );
        return response.data;
    }

    // Bulk update status
    async bulkUpdateStatus(
        faqIds: string[],
        status: 'active' | 'inactive' | 'draft'
    ): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.patch(
            `faqs/bulk-status`,
            { faqIds, status },
        );
        return response.data;
    }
}

export const faqService = new FAQService();