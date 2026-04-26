import { apiClient } from './api';
import type { IPopupBanner } from '../types/popupBanner';

class PopupBannerService {
    async getAll(): Promise<{ success: boolean; data: IPopupBanner[] }> {
        const response = await apiClient.get('/popup-banners');
        return response.data;
    }

    async create(formData: FormData): Promise<{ success: boolean; message: string; data: IPopupBanner }> {
        const response = await apiClient.post('/popup-banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async toggleStatus(id: string): Promise<{ success: boolean; message: string; data: IPopupBanner }> {
        const response = await apiClient.patch(`/popup-banners/${id}/toggle`);
        return response.data;
    }

    async remove(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete(`/popup-banners/${id}`);
        return response.data;
    }
}

export const popupBannerService = new PopupBannerService();
