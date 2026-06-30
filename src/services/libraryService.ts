import { apiClient } from './api';
import type { ILibraryResource } from '../types/library';

class LibraryService {
    // Admin list — every resource regardless of status.
    async getAll(): Promise<{ success: boolean; data: ILibraryResource[] }> {
        const response = await apiClient.get('/library/admin/resources');
        return response.data;
    }

    async create(formData: FormData): Promise<{ success: boolean; data: ILibraryResource }> {
        const response = await apiClient.post('/library/resources', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async toggleStatus(id: string): Promise<{ success: boolean; data: ILibraryResource }> {
        const response = await apiClient.patch(`/library/resources/${id}/toggle`);
        return response.data;
    }

    async remove(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete(`/library/resources/${id}`);
        return response.data;
    }
}

export const libraryService = new LibraryService();
