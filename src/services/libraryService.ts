import { apiClient } from './api';
import type { ILibraryResource } from '../types/library';

class LibraryService {
    // Admin list — every resource regardless of status.
    async getAll(): Promise<{ success: boolean; data: ILibraryResource[] }> {
        const response = await apiClient.get('/library');
        return response.data;
    }

    async create(formData: FormData): Promise<{ success: boolean; data: ILibraryResource }> {
        const response = await apiClient.post('/library', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    // The status endpoint sets an explicit value — it does not flip anything, and
    // sending no body at all is a 400. The caller passes the state it wants.
    async setStatus(
        id: string,
        status: 'active' | 'inactive' | 'draft'
    ): Promise<{ success: boolean; data: ILibraryResource }> {
        const response = await apiClient.patch(`/library/${id}/status`, { status });
        return response.data;
    }

    async remove(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete(`/library/${id}`);
        return response.data;
    }
}

export const libraryService = new LibraryService();
