import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authStorage, clearAuthStorage } from '@/lib/authStorage';
import type { User } from '../types/auth';

/** module → action → allowed, exactly as the API resolves it. */
export type PermissionMap = Record<string, Record<string, boolean>>;

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    /**
     * The resolved permission map from the login response.
     *
     * web-admin signs in with a CRM employee account now, so what someone may
     * author is a permission (`cms`), not a job title. The sidebar hides what
     * the API would refuse — a menu item that 403s is worse than no menu item.
     */
    permissions: PermissionMap;
    isAuthenticated: boolean;
    login: (user: User, token: string, extra?: { refreshToken?: string; permissions?: PermissionMap }) => void;
    /** A refreshed token pair. Identity and permissions are unchanged. */
    setTokens: (token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            permissions: {},
            isAuthenticated: false,
            login: (user, token, extra) => set({
                user,
                token,
                refreshToken: extra?.refreshToken ?? null,
                permissions: extra?.permissions ?? {},
                isAuthenticated: true,
            }),
            setTokens: (token, refreshToken) => set({ token, refreshToken }),
            logout: () => {
                set({
                    user: null, token: null, refreshToken: null,
                    permissions: {}, isAuthenticated: false,
                });
                // AFTER the set, not before: persist writes the cleared state
                // back synchronously, so clearing first would leave the key
                // behind again. Both stores, since a sign-in may have landed in
                // either depending on "Keep me logged in".
                clearAuthStorage();
            },
        }),
        {
            name: 'auth-storage',
            // localStorage or sessionStorage, per the "Keep me logged in" box.
            storage: authStorage,
        }
    )
);

/**
 * Whether the signed-in employee may do this.
 *
 * One helper, checked the same way the server checks it, so the UI and the API
 * cannot disagree about who may publish a course.
 */
export function useCan(module: string, action: string): boolean {
    return useAuthStore((s) => Boolean(s.permissions?.[module]?.[action]));
}
