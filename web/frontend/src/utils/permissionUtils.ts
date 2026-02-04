/**
 * توزيع الصلاحيات على المسارات حسب الأدوار.
 * يمكن تغيير الأدوار من صفحة الإعدادات → الأدوار والصلاحيات.
 */

export const SECTION_ROLES = {
  /** دورة المشتريات: مدير المشتريات، مشتري، إدارة (PM لا يرى المخازن ولا العمليات) */
  procurement: ['PM', 'BUYER', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'],
  /** دورة المبيعات */
  sales: ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'],
  /** المخازن والأصناف */
  warehouse: ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'],
  /** العمليات: معاملات الجودة، وحدات، قوائم أسعار */
  operations: ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM', 'SM'],
  /** العملاء (CRM) */
  crm: ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'],
  /** إعدادات النظام */
  system: ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
  /** المستخدمين فقط */
  users: ['ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
  /** الموظفين فقط */
  employees: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
} as const;

/** مسارات لا تحتاج صلاحية (جميع من سجّل دخوله) */
const PUBLIC_PATHS = ['/dashboard', '/dashboard/approvals'];

/**
 * يُرجع أدوار الصلاحية المطلوبة للمسار، أو null إذا المسار متاح للجميع.
 */
export function getRequiredRolesForPath(path: string): string[] | null {
  if (PUBLIC_PATHS.some((p) => path === p || (p !== '/dashboard' && path.startsWith(p)))) {
    return null;
  }
  if (path.startsWith('/dashboard/procurement')) return [...SECTION_ROLES.procurement];
  if (path.startsWith('/dashboard/sales')) return [...SECTION_ROLES.sales];
  if (path.startsWith('/dashboard/crm')) return [...SECTION_ROLES.crm];
  if (path.startsWith('/dashboard/settings')) return [...SECTION_ROLES.system];
  if (path.startsWith('/dashboard/users') || path === '/dashboard/users') return [...SECTION_ROLES.users];
  if (path.startsWith('/dashboard/employees') || path === '/dashboard/employees') return [...SECTION_ROLES.employees];
  // inventory: جزء عمليات (quality-parameters, price-lists, units) والباقي مخازن
  if (path.startsWith('/dashboard/inventory')) {
    if (
      path.includes('quality-parameters') ||
      path.includes('price-lists') ||
      path.includes('units')
    ) {
      return [...SECTION_ROLES.operations];
    }
    return [...SECTION_ROLES.warehouse];
  }
  return null;
}

/**
 * يتحقق إن كان المستخدم (بدوره الحالي) يملك صلاحية الدخول للمسار.
 */
export function canAccessPath(path: string, userRole: string): boolean {
  const roles = getRequiredRolesForPath(path);
  if (!roles || roles.length === 0) return true;
  const roleUpper = (userRole || '').toUpperCase();
  return roles.includes(roleUpper);
}
