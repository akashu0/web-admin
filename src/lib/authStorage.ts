import { createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

/**
 * Where the signed-in session is kept, decided by "Keep me logged in".
 *
 * Ticked  → localStorage:   survives closing the browser. What this app has
 *                           always done, and still the default.
 * Cleared → sessionStorage: dies with the tab, which is the point on a shared
 *                           or public machine.
 *
 * The API makes the same distinction on its side — an unremembered sign-in gets
 * a twelve-hour session instead of a week — so a token left behind in a
 * restored tab is refused rather than merely inconvenient. Neither half is
 * enough alone: this one alone leaves a usable refresh token on the server, and
 * that one alone leaves the tokens sitting in localStorage.
 */

/** The persist keys this app owns. Listed so switching storage can clear the
 *  copy left in the other one — a stale token nobody can see is still a token. */
const AUTH_KEYS = ['auth-storage'];

const REMEMBER_KEY = 'eg-remember';

/**
 * Absent means yes. Anyone already signed in when this shipped has no flag
 * stored, and their session must be read from localStorage exactly as before
 * rather than vanishing on the next page load.
 */
export function remembered(): boolean {
    try {
        return window.localStorage.getItem(REMEMBER_KEY) !== '0';
    } catch {
        // Private mode, or storage blocked entirely. Fall back to the default
        // rather than throwing inside a zustand read.
        return true;
    }
}

/** Records the choice and clears whatever the other storage still holds. Call
 *  it BEFORE writing the session, so the first write lands in the right place. */
export function setRemember(on: boolean): void {
    try {
        const stale = on ? window.sessionStorage : window.localStorage;
        AUTH_KEYS.forEach((key) => stale.removeItem(key));
        window.localStorage.setItem(REMEMBER_KEY, on ? '1' : '0');
    } catch {
        /* nothing to record if storage is unavailable */
    }
}

/** Sign-out: the session goes from both, and the choice with it. */
export function clearAuthStorage(): void {
    try {
        AUTH_KEYS.forEach((key) => {
            window.localStorage.removeItem(key);
            window.sessionStorage.removeItem(key);
        });
        window.localStorage.removeItem(REMEMBER_KEY);
    } catch {
        /* nothing to clear */
    }
}

function active(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
        return remembered() ? window.localStorage : window.sessionStorage;
    } catch {
        return null;
    }
}

/**
 * The indirection matters: zustand calls createJSONStorage's factory ONCE, at
 * store creation, so `() => remembered() ? localStorage : sessionStorage` would
 * freeze the choice made at page load. Handing it a stable object whose three
 * methods each re-read the flag is what makes the switch take effect the moment
 * someone signs in.
 */
const dynamic: StateStorage = {
    getItem: (name) => active()?.getItem(name) ?? null,
    setItem: (name, value) => active()?.setItem(name, value),
    removeItem: (name) => active()?.removeItem(name),
};

export const authStorage = createJSONStorage(() => dynamic);
