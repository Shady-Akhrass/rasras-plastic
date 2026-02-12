/**
 * صلاحيات المسارات: إما ديناميكية بالصلاحيات (من لوحة التحكم) أو بالأدوار (احتياطي).
 * الصلاحيات تُعيّن من: الإعدادات → الأدوار والصلاحيات (مثل SECTION_WAREHOUSE، SECTION_SALES).
 */

export const SECTION_ROLES = {
  procurement: ['PM', 'BUYER', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'],
  sales: ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'],
  warehouse: ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM', 'WAREHOUSE_MANAGER', 'WH_MANAGER'],
  operations: ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM', 'SM'],
  crm: ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'],
  system: ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
  users: ['ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
  employees: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
} as const;

/** مسارات متاحة لجميع من سجّل دخوله */
const PUBLIC_PATHS = ['/dashboard', '/dashboard/approvals', '/dashboard/profile'];

/** ربط المسار بصلاحية القسم (تُعيّن من لوحة التحكم → الأدوار والصلاحيات) */
function getRequiredPermissionForPath(path: string): string | null {
  if (PUBLIC_PATHS.some((p) => path === p || (p !== '/dashboard' && path.startsWith(p)))) return null;
  if (path.startsWith('/dashboard/users') || path === '/dashboard/users') return 'SECTION_USERS';
  if (path.startsWith('/dashboard/employees') || path === '/dashboard/employees') return 'SECTION_EMPLOYEES';
  if (path.startsWith('/dashboard/hr')) return 'SECTION_EMPLOYEES';
  if (path.startsWith('/dashboard/settings')) return 'SECTION_SYSTEM';
  if (path.startsWith('/dashboard/procurement')) return 'SECTION_PROCUREMENT';
  if (path.startsWith('/dashboard/sales')) return 'SECTION_SALES';
  if (path.startsWith('/dashboard/crm')) return 'SECTION_CRM';
  if (path.startsWith('/dashboard/inventory')) {
    if (path.includes('quality-parameters') || path.includes('price-lists') || path.includes('units')) return 'SECTION_OPERATIONS';
    return 'SECTION_WAREHOUSE';
  }
  return null;
}

export function getRequiredRolesForPath(path: string): string[] | null {
  if (PUBLIC_PATHS.some((p) => path === p || (p !== '/dashboard' && path.startsWith(p)))) return null;
  if (path.startsWith('/dashboard/procurement')) return [...SECTION_ROLES.procurement];
  if (path.startsWith('/dashboard/sales')) return [...SECTION_ROLES.sales];
  if (path.startsWith('/dashboard/crm')) return [...SECTION_ROLES.crm];
  if (path.startsWith('/dashboard/settings')) return [...SECTION_ROLES.system];
  if (path.startsWith('/dashboard/users') || path === '/dashboard/users') return [...SECTION_ROLES.users];
  if (path.startsWith('/dashboard/employees') || path === '/dashboard/employees') return [...SECTION_ROLES.employees];
  if (path.startsWith('/dashboard/hr')) return [...SECTION_ROLES.employees];
  if (path.startsWith('/dashboard/inventory')) {
    if (path.includes('quality-parameters') || path.includes('price-lists') || path.includes('units')) return [...SECTION_ROLES.operations];
    return [...SECTION_ROLES.warehouse];
  }
  return null;
}

/**
 * يتحقق إن كان المستخدم يملك صلاحية الدخول للمسار.
 * يعتمد على الصلاحيات فقط (ديناميكياً من لوحة التحكم → الأدوار والصلاحيات).
 */
export function canAccessPath(
  path: string,
  _userRole: string,
  userPermissions?: string[] | null
): boolean {
  const required = getRequiredPermissionForPath(path);
  if (!required) return true;
  return !!(userPermissions && userPermissions.length > 0 && userPermissions.includes(required));
}
