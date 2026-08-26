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

/**
 * Renew the access token instead of signing the employee out.
 *
 * The access token lives 15 minutes; the refresh token, which login already
 * returns and the store already keeps, lives 30 days and is re-issued on every
 * use. Before this, a 401 went straight to logout — so anyone who spent more
 * than a quarter of an hour filling in a record was thrown back to the login
 * screen the moment they pressed Save, and lost the form.
 *
 * ONE refresh at a time, shared by every caller that 401s. The server ROTATES
 * the refresh token, so two concurrent refreshes would race: the second sends a
 * token the first has already replaced, gets rejected, and signs everyone out —
 * which is the failure this exists to prevent.
 */
let refreshing: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
    if (refreshing) return refreshing;

    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return Promise.reject(new Error('no refresh token'));

    // A bare axios call: going through apiClient would send the dead token and
    // recurse into this same interceptor.
    refreshing = axios
        .post(`${BASE_URL}/auth/refresh`, { refreshToken })
        .then((res) => {
            const next = res.data?.data;
            if (!next?.token || !next?.refreshToken) throw new Error('bad refresh response');
            useAuthStore.getState().setTokens(next.token, next.refreshToken);
            return next.token as string;
        })
        .finally(() => {
            refreshing = null;
        });

    return refreshing;
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const isAuthCall = typeof original?.url === 'string' && original.url.includes('/auth/');

        // `_retried` so a request is only ever replayed once: if the renewed
        // token is refused too, the session really is gone.
        if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
            original._retried = true;
            try {
                const token = await refreshAccessToken();
                original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
                return apiClient(original);
            } catch {
                useAuthStore.getState().logout();
            }
        } else if (error.response?.status === 401 && !isAuthCall) {
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
