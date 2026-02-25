/**
 * اختبار تغطية مسارات لوحة التحكم في PATH_PERMISSION_PATTERNS.
 * عند إضافة Route جديد تحت /dashboard في App.tsx، أضف المسار هنا (في المسارات العامة أو المحمية)
 * ثم أضف النمط المناسب في permissionUtils.ts؛ وإلا سيفشل الاختبار.
 */
import { describe, it, expect } from 'vitest';
import { getRequiredPermissionForPath, canAccessPath } from './permissionUtils';

/** مسارات عامة: لا تحتاج صلاحية (أي مستخدم مسجّل يدخل) */
const PUBLIC_PATHS = [
  '/dashboard',
  '/dashboard/approvals',
  '/dashboard/approvals/audit',
  '/dashboard/profile',
];

/** مسارات محمية: يجب أن يكون لها نمط في PATH_PERMISSION_PATTERNS وتتطلب صلاحية */
const PROTECTED_PATHS = [
  '/dashboard/settings',
  '/dashboard/settings/roles',
  '/dashboard/settings/permissions',
  '/dashboard/settings/company',
  '/dashboard/users',
  '/dashboard/employees',
  '/dashboard/hr/shifts',
  '/dashboard/procurement',
  '/dashboard/procurement/pr',
  '/dashboard/procurement/invoices',
  '/dashboard/sales',
  '/dashboard/sales/orders',
  '/dashboard/crm',
  '/dashboard/crm/customers',
  '/dashboard/finance',
  '/dashboard/finance/payment-vouchers',
  '/dashboard/inventory/sections',
  '/dashboard/inventory/warehouses',
  '/dashboard/inventory/stocks',
  '/dashboard/inventory/quality-parameters',
  '/dashboard/inventory/price-lists',
  '/dashboard/audit',
];

describe('permissionUtils', () => {
  describe('getRequiredPermissionForPath', () => {
    it('returns null for public paths', () => {
      for (const path of PUBLIC_PATHS) {
        expect(getRequiredPermissionForPath(path)).toBeNull();
      }
    });

    it('returns a permission string for protected paths', () => {
      for (const path of PROTECTED_PATHS) {
        const perm = getRequiredPermissionForPath(path);
        expect(perm).not.toBeNull();
        expect(typeof perm).toBe('string');
        expect(perm).not.toBe('__PUBLIC__');
      }
    });
  });

  describe('canAccessPath', () => {
    it('allows public paths without permissions', () => {
      for (const path of PUBLIC_PATHS) {
        expect(canAccessPath(path, '', [])).toBe(true);
        expect(canAccessPath(path, '', null)).toBe(true);
      }
    });

    it('denies protected paths without permissions', () => {
      for (const path of PROTECTED_PATHS) {
        expect(canAccessPath(path, '', [])).toBe(false);
        expect(canAccessPath(path, '', null)).toBe(false);
      }
    });

    it('allows protected path when user has required permission', () => {
      expect(canAccessPath('/dashboard/settings/roles', '', ['SECTION_SYSTEM'])).toBe(true);
      expect(canAccessPath('/dashboard/procurement/pr', '', ['SECTION_PROCUREMENT'])).toBe(true);
      expect(canAccessPath('/dashboard/inventory/sections', '', ['INVENTORY_VIEW'])).toBe(true);
    });
  });
});
