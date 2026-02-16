import apiClient from './apiClient';
import { USER_KEY } from './authUtils';

export interface CurrentUserDto {
  userId: number;
  employeeId?: number;
  username: string;
  roleCode: string;
  roleName?: string;
  fullNameAr?: string;
  permissions: string[];
}

/**
 * يجلب المستخدم الحالي مع الصلاحيات من الخادم ويحدّث localStorage.
 * استخدمه عند تغيّر الدور أو لتحديث الصلاحيات دون إعادة تسجيل الدخول.
 * لا تعتمد على localStorage فقط — يُفضّل استدعاء هذا عند فتح التطبيق أو عند الحاجة.
 */
export async function refreshUserPermissions(): Promise<CurrentUserDto | null> {
  try {
    const response = await apiClient.get<{ data: CurrentUserDto }>('/auth/me');
    const user = response.data?.data;
    if (user) {
      const stored = JSON.stringify({
        userId: user.userId,
        employeeId: user.employeeId,
        username: user.username,
        roleCode: user.roleCode,
        roleName: user.roleName,
        fullNameAr: user.fullNameAr,
        permissions: user.permissions ?? [],
      });
      localStorage.setItem(USER_KEY, stored);
      return user;
    }
  } catch {
    // 401 سيؤدي إلى clearSession عبر الـ interceptor
  }
  return null;
}
