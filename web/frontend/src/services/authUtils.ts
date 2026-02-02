/**
 * Central auth utilities: session clear and JWT expiry for auto-logout when session ends.
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const LOGIN_PATH = '/login';

/**
 * Clears all auth data from localStorage and redirects to login (full logout).
 */
export function clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = LOGIN_PATH;
}

/**
 * Decodes JWT payload (no verification; used only to read exp).
 * Returns expiry time in milliseconds since epoch, or null if invalid/missing exp.
 */
export function getTokenExpiryMs(token: string): number | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        const data = JSON.parse(json) as { exp?: number };
        if (typeof data.exp !== 'number') return null;
        return data.exp * 1000;
    } catch {
        return null;
    }
}

/**
 * Returns delay in ms until token expires (or 0 if already expired).
 */
export function getSessionRemainingMs(token: string): number {
    const expiryMs = getTokenExpiryMs(token);
    if (expiryMs == null) return 0;
    const remaining = expiryMs - Date.now();
    return Math.max(0, remaining);
}
