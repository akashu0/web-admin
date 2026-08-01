import { apiClient } from './api';
import type { IPopupBanner } from '../types/popupBanner';

class PopupBannerService {
    async getAll(): Promise<{ success: boolean; data: IPopupBanner[] }> {
        const response = await apiClient.get('/banners');
        return response.data;
    }

    async create(formData: FormData): Promise<{ success: boolean; message: string; data: IPopupBanner }> {
        const response = await apiClient.post('/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    // Explicit value, not a flip: the endpoint takes `isActive`, and an empty
    // PATCH body is a 400.
    async setActive(
        id: string,
        isActive: boolean
    ): Promise<{ success: boolean; message: string; data: IPopupBanner }> {
        const response = await apiClient.patch(`/banners/${id}/status`, { isActive });
        return response.data;
    }

    async remove(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete(`/banners/${id}`);
        return response.data;
    }
}

export const popupBannerService = new PopupBannerService();
