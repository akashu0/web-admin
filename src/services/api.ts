import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// The Go API's staff surface (/api/staff). Every response is the shared
// envelope — { success, data, pagination? , cursor? , message?, code? } — so
// `unwrap` below is the one place that knows about it.
const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

/**
 * The API's error message, or a fallback.
 *
 * The envelope carries `message` and a machine-readable `code`; a 403 from the
 * permission layer also carries which module and action were missing, which is
 * worth showing rather than a generic "forbidden".
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
    const e = error as { response?: { data?: { message?: string; details?: Record<string, string> } } };
    const body = e?.response?.data;
    if (!body?.message) return fallback;
    if (body.details?.module && body.details?.action) {
        return `${body.message} (${body.details.module}:${body.details.action})`;
    }
    return body.message;
}

/**
 * The column order a list is asking for. Every list endpoint takes these two
 * params and only these two: a field NAME the server resolves against its own
 * whitelist, and a direction.
 *
 * This replaces the `sortBy`/`sortOrder` pair that used to sit unused in three
 * of the query-param types — the API never read them, and now that it reads
 * these, two spellings for one idea is how the wrong one gets sent.
 */
export interface SortParams {
    sort?: string;
    dir?: 'asc' | 'desc';
}
