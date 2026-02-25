/**
 * Auth service: current user and permission refresh without re-login.
 * تستدعى من DashboardLayout عند التحميل لتحديث الصلاحيات من الخادم.
 * من المرحلة 5: يجلب أيضاً قواعد المسارات (path-rules) من الـ API للتحكم الديناميكي.
 */

import apiClient from './apiClient';
import { USER_KEY } from './authUtils';
import { setPathRulesFromApi, type PathRuleFromApi } from '../utils/permissionUtils';

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
 * Fetches path rules from GET /api/permissions/path-rules and stores them in permissionUtils.
 * On failure or empty response, leaves path rules unchanged (fallback to static patterns).
 */
export async function fetchPathRules(): Promise<void> {
  try {
    const response = await apiClient.get<PathRuleFromApi[]>('/permissions/path-rules');
    const rules = Array.isArray(response.data) ? response.data : null;
    setPathRulesFromApi(rules && rules.length > 0 ? rules : null);
  } catch {
    setPathRulesFromApi(null);
  }
}

/**
 * Fetches current user and permissions from GET /auth/me and updates localStorage.
 * Also fetches path-rules so the frontend uses API-driven path permissions when available.
 * Returns true if update succeeded, false if not authenticated or request failed.
 */
export async function refreshUserPermissions(): Promise<boolean> {
  try {
    const response = await apiClient.get<{ data: CurrentUser }>('/auth/me');
    const user = response.data?.data;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      await fetchPathRules();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
