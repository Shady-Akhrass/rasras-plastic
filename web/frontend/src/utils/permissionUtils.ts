/**
 * صلاحيات المسارات: إما ديناميكية بالصلاحيات (من لوحة التحكم) أو بالأدوار (احتياطي).
 * الصلاحيات تُعيّن من: الإعدادات → الأدوار والصلاحيات (مثل SECTION_WAREHOUSE، SECTION_SALES).
 */

import { ROLE_CODES } from '../constants/roleCodes';

/** أدوار الأقسام — مصدر الحقيقة لأكواد الأدوار: جدول roles. استخدم ROLE_CODES بدلاً من Strings. */
export const SECTION_ROLES = {
  /** GM و ADMIN لهم override access دائمًا — وثّق في توثيق_الصلاحيات.md */
  main: [ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM, ROLE_CODES.FINANCE_MANAGER, ROLE_CODES.ACCOUNTANT, ROLE_CODES.PROCUREMENT_MANAGER, ROLE_CODES.BUYER, ROLE_CODES.SALES_MANAGER, ROLE_CODES.WAREHOUSE_KEEPER, ROLE_CODES.QUALITY_CONTROLLER],
  procurement: [ROLE_CODES.PROCUREMENT_MANAGER, ROLE_CODES.BUYER, ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM],
  sales: [ROLE_CODES.SALES_MANAGER, ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM],
  finance: [ROLE_CODES.FINANCE_MANAGER, ROLE_CODES.ACCOUNTANT, ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM],
  warehouse: [ROLE_CODES.WAREHOUSE_KEEPER, ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM],
  operations: [ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM, ROLE_CODES.SALES_MANAGER],
  crm: [ROLE_CODES.SALES_MANAGER, ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM],
  system: [ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN],
  users: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN],
  employees: [ROLE_CODES.ADMIN, ROLE_CODES.HR, ROLE_CODES.MANAGER, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN],
} as const;

/** مسارات متاحة لجميع من سجّل دخوله */


/**
 * أنماط المسارات وربطها بالصلاحيات — يغطي المسارات الديناميكية مثل /dashboard/finance/payments/123
 * الترتيب مهم: الأكثر تحديداً أولاً (مثلاً /dashboard/procurement/grn قبل /dashboard/procurement)
 */
const PATH_PERMISSION_PATTERNS: Array<{ test: (p: string) => boolean; permission: string }> = [
  { test: (p) => p === '/dashboard' || p.startsWith('/dashboard/approvals') || p.startsWith('/dashboard/profile'), permission: '__PUBLIC__' },
  { test: (p) => p.startsWith('/dashboard/users'), permission: 'SECTION_USERS' },
  { test: (p) => p.startsWith('/dashboard/employees') || p.startsWith('/dashboard/hr'), permission: 'SECTION_EMPLOYEES' },
  { test: (p) => p.startsWith('/dashboard/settings'), permission: 'SECTION_SYSTEM' },
  { test: (p) => p.startsWith('/dashboard/procurement') && (p.includes('/waiting-imports') || p.includes('/grn')), permission: 'SECTION_OPERATIONS' },
  { test: (p) => p.startsWith('/dashboard/procurement'), permission: 'SECTION_PROCUREMENT' },
  { test: (p) => p.startsWith('/dashboard/audit'), permission: 'SECTION_MAIN' },
  { test: (p) => p.startsWith('/dashboard/sales'), permission: 'SECTION_SALES' },
  { test: (p) => p.startsWith('/dashboard/crm'), permission: 'SECTION_CRM' },
  { test: (p) => p.startsWith('/dashboard/finance'), permission: 'SECTION_FINANCE' },
  { test: (p) => p.startsWith('/dashboard/inventory') && (p.includes('quality-inspection') || p.includes('quality-parameters') || p.includes('price-lists') || p.includes('units') || p.includes('categories') || p.includes('items')), permission: 'SECTION_OPERATIONS' },
  { test: (p) => p.startsWith('/dashboard/inventory'), permission: 'SECTION_WAREHOUSE' },
];

/** ربط المسار بصلاحية القسم (يغطي patterns ومسارات ديناميكية). مُصدَّر للاختبارات. */
export function getRequiredPermissionForPath(path: string): string | null {
  for (const { test, permission } of PATH_PERMISSION_PATTERNS) {
    if (test(path)) return permission === '__PUBLIC__' ? null : permission;
  }
  return null;
}

const PERMISSION_TO_SECTION: Record<string, keyof typeof SECTION_ROLES> = {
  SECTION_MAIN: 'main',
  SECTION_USERS: 'users',
  SECTION_EMPLOYEES: 'employees',
  SECTION_FINANCE: 'finance',
  SECTION_WAREHOUSE: 'warehouse',
  SECTION_OPERATIONS: 'operations',
  SECTION_SALES: 'sales',
  SECTION_CRM: 'crm',
  SECTION_SYSTEM: 'system',
  SECTION_PROCUREMENT: 'procurement',
};

export function getRequiredRolesForPath(path: string): string[] | null {
  const perm = getRequiredPermissionForPath(path);
  if (!perm) return null;
  const key = PERMISSION_TO_SECTION[perm];
  return key ? [...SECTION_ROLES[key]] : null;
}

/**
 * يتحقق إن كان المستخدم يملك صلاحية الدخول للمسار.
 * يعتمد على الصلاحيات فقط (ديناميكياً من لوحة التحكم → الأدوار والصلاحيات).
 */
export function canAccessPath(
  path: string,
  userRole: string,
  userPermissions?: string[] | null
): boolean {
  const required = getRequiredPermissionForPath(path);
  if (!required) return true;

  // 1. Try permissions first if available
  if (userPermissions && userPermissions.length > 0) {
    if (userPermissions.includes(required)) return true;
  }

  // 2. Fallback to roles
  const upperRole = userRole.toUpperCase();
  // Admin/Superadmin bypass
  if (['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'].includes(upperRole)) return true;

  const requiredRoles = getRequiredRolesForPath(path);
  if (!requiredRoles || requiredRoles.length === 0) return true;

  return requiredRoles.includes(upperRole);
}
