/**
 * Auth service: current user and permission refresh without re-login.
 * تستدعى من DashboardLayout عند التحميل لتحديث الصلاحيات من الخادم.
 */

import apiClient from './apiClient';
import { USER_KEY } from './authUtils';

export interface CurrentUser {
  userId: number;
  employeeId?: number | null;
  username: string;
  roleCode?: string | null;
  roleName?: string | null;
  fullNameAr?: string;
  permissions?: string[];
}

/**
 * Fetches current user and permissions from GET /auth/me and updates localStorage.
 * Returns true if update succeeded, false if not authenticated or request failed.
 */
export async function refreshUserPermissions(): Promise<boolean> {
  try {
    const response = await apiClient.get<{ data: CurrentUser }>('/auth/me');
    const user = response.data?.data;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
