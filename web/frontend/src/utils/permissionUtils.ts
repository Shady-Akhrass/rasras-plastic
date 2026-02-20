/**
 * صلاحيات المسارات: تعتمد فقط على PermissionCode (من لوحة التحكم → الأدوار والصلاحيات).
 * لا يوجد fallback على الأدوار (roleCode) — "كامل الوصول" يتحقق عبر امتلاك الصلاحيات
 * (مثلاً ADMIN و GM يملكان كل SECTION_* من الـ Seed/لوحة الصلاحيات).
 */

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

/** ربط المسار بصلاحية القسم (يغطي patterns ومسارات ديناميكية). مُصدَّر للاختبارات. */
export function getRequiredPermissionForPath(path: string): string | null {
  for (const { test, permission } of PATH_PERMISSION_PATTERNS) {
    if (test(path)) return permission === '__PUBLIC__' ? null : permission;
  }
  return null;
}

/**
 * يتحقق إن كان المستخدم يملك صلاحية الدخول للمسار.
 * يعتمد فقط على userPermissions (PermissionCode) — لا fallback على الأدوار.
 */
export function canAccessPath(
  path: string,
  _userRole: string,
  userPermissions?: string[] | null
): boolean {
  const required = getRequiredPermissionForPath(path);
  if (!required) return true;

  return userPermissions?.includes(required) ?? false;
}
