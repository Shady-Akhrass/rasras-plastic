/**
 * صلاحيات المسارات: تعتمد على PermissionCode (من لوحة التحكم → الأدوار والصلاحيات).
 * يمكن منح الدخول إما بصلاحية القسم (SECTION_*) أو بصلاحية عنصر القائمة (MENU_*) للمسار،
 * حتى لا يظهر الرابط في السايد بار ثم يُمنع المستخدم عند الدخول.
 *
 * من المرحلة 5: يمكن جلب قواعد المسارات من الـ API (GET /api/permissions/path-rules).
 * إن وُجدت قواعد من الـ API تُستخدم أولاً؛ وإلا يُستخدم PATH_PERMISSION_PATTERNS كـ fallback.
 *
 * قاعدة إلزامية: كل Route جديد تحت /dashboard في App.tsx يجب أن يكون له نمط مطابق هنا
 * في PATH_PERMISSION_PATTERNS أو في جدول path_permission (PathType=FRONTEND)؛ وإلا سيمنع canAccessPath.
 */

/** نوع قاعدة مسار قادمة من الـ API (path-rules). */
export interface PathRuleFromApi {
  pathPattern: string;
  httpMethod?: string;
  permissionCode: string;
}

/** قواعد المسارات من الـ API. إن وُجدت تُستخدم في canAccessPath بدل المصفوفة الثابتة (مع fallback). */
let pathRulesFromApi: PathRuleFromApi[] | null = null;

/**
 * تعيين قواعد المسارات من الـ API (يُستدعى بعد جلب GET /api/permissions/path-rules).
 * استدعاء setPathRulesFromApi(null) يعيد الاعتماد على المصفوفة الثابتة فقط.
 */
export function setPathRulesFromApi(rules: PathRuleFromApi[] | null): void {
  pathRulesFromApi = rules;
}

/**
 * مطابقة مسار مع نمط Ant-style (* = segment واحد، ** = صفر أو أكثر من المقاطع).
 */
function antMatch(path: string, pattern: string): boolean {
  const parts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);
  let p = 0;
  let q = 0;
  while (p < patternParts.length && q < parts.length) {
    if (patternParts[p] === '**') {
      return true;
    }
    if (patternParts[p] === '*' || patternParts[p] === parts[q]) {
      p++;
      q++;
      continue;
    }
    return false;
  }
  if (p < patternParts.length && patternParts[p] === '**') p++;
  return p === patternParts.length && q === parts.length;
}

/**
 * أنماط المسارات: أي صلاحية من المصفوفة تكفي للدخول.
 * الترتيب مهم: الأكثر تحديداً أولاً (مثلاً /dashboard/settings/roles قبل /dashboard/settings).
 */
const PATH_PERMISSION_PATTERNS: Array<{ test: (p: string) => boolean; permissions: string[] }> = [
  { test: (p) => p === '/dashboard' || p.startsWith('/dashboard/approvals') || p.startsWith('/dashboard/profile'), permissions: ['__PUBLIC__'] },
  // إعدادات النظام — مسارات فرعية مع صلاحية عنصر القائمة
  { test: (p) => p.startsWith('/dashboard/settings/roles'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_ROLES'] },
  { test: (p) => p.startsWith('/dashboard/settings/permissions'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_PERMISSIONS'] },
  { test: (p) => p.startsWith('/dashboard/settings/users'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_USERS'] },
  { test: (p) => p.startsWith('/dashboard/settings/company'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_COMPANY'] },
  { test: (p) => p.startsWith('/dashboard/settings/units'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_UNITS'] },
  { test: (p) => p.startsWith('/dashboard/settings/system'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_SETTINGS'] },
  { test: (p) => p.startsWith('/dashboard/settings/security'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_SECURITY'] },
  { test: (p) => p.startsWith('/dashboard/settings/notifications'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_NOTIFICATIONS'] },
  { test: (p) => p.startsWith('/dashboard/settings/database'), permissions: ['SECTION_SYSTEM', 'MENU_SYSTEM_DATABASE'] },
  { test: (p) => p.startsWith('/dashboard/settings'), permissions: ['SECTION_SYSTEM'] },
  // المستخدمون والرئيسية
  { test: (p) => p.startsWith('/dashboard/users'), permissions: ['SECTION_USERS', 'MENU_MAIN_USERS'] },
  // الموارد البشرية
  { test: (p) => p.startsWith('/dashboard/employees'), permissions: ['SECTION_EMPLOYEES', 'MENU_HR_EMPLOYEES', 'MENU_MAIN_EMPLOYEE_DATA'] },
  { test: (p) => p.startsWith('/dashboard/hr/leave-types'), permissions: ['SECTION_EMPLOYEES', 'MENU_HR_LEAVE_TYPES'] },
  { test: (p) => p.startsWith('/dashboard/hr/shifts'), permissions: ['SECTION_EMPLOYEES', 'MENU_HR_SHIFTS'] },
  { test: (p) => p.startsWith('/dashboard/hr/holidays'), permissions: ['SECTION_EMPLOYEES', 'MENU_HR_HOLIDAYS'] },
  { test: (p) => p.startsWith('/dashboard/hr/employee-shifts'), permissions: ['SECTION_EMPLOYEES', 'MENU_HR_EMPLOYEE_SHIFTS'] },
  { test: (p) => p.startsWith('/dashboard/hr/attendance'), permissions: ['SECTION_EMPLOYEES', 'MENU_HR_ATTENDANCE'] },
  { test: (p) => p.startsWith('/dashboard/hr/payroll'), permissions: ['SECTION_EMPLOYEES', 'MENU_HR_PAYROLL'] },
  { test: (p) => p.startsWith('/dashboard/hr'), permissions: ['SECTION_EMPLOYEES'] },
  // المشتريات — مسارات فرعية
  { test: (p) => p.startsWith('/dashboard/procurement') && (p.includes('/waiting-imports') || p.includes('/grn')), permissions: ['SECTION_OPERATIONS', 'SECTION_PROCUREMENT', 'MENU_PROCUREMENT_WAITING_IMPORTS', 'MENU_PROCUREMENT_GRN'] },
  { test: (p) => p.startsWith('/dashboard/procurement/pr'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_PR'] },
  { test: (p) => p.startsWith('/dashboard/procurement/rfq'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_RFQ'] },
  { test: (p) => p.startsWith('/dashboard/procurement/quotation'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_QUOTATION'] },
  { test: (p) => p.startsWith('/dashboard/procurement/comparison'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_COMPARISON'] },
  { test: (p) => p.startsWith('/dashboard/procurement/po'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_PO'] },
  { test: (p) => p.startsWith('/dashboard/procurement/grn'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_GRN'] },
  { test: (p) => p.startsWith('/dashboard/procurement/invoices'), permissions: ['SECTION_PROCUREMENT', 'SUPPLIER_INVOICE_VIEW', 'MENU_PROCUREMENT_INVOICES'] },
  { test: (p) => p.startsWith('/dashboard/procurement/suppliers'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_OUTSTANDING', 'MENU_PROCUREMENT_SUPPLIERS'] },
  { test: (p) => p.startsWith('/dashboard/procurement/returns'), permissions: ['SECTION_PROCUREMENT', 'MENU_PROCUREMENT_RETURNS'] },
  { test: (p) => p.startsWith('/dashboard/procurement'), permissions: ['SECTION_PROCUREMENT'] },
  // المبيعات
  { test: (p) => p.startsWith('/dashboard/sales/sections'), permissions: ['SECTION_SALES', 'MENU_SALES_SECTIONS'] },
  { test: (p) => p.startsWith('/dashboard/sales/customers-outstanding'), permissions: ['SECTION_SALES', 'MENU_SALES_OUTSTANDING', 'MENU_CRM_OUTSTANDING'] },
  { test: (p) => p.startsWith('/dashboard/sales/purchase-requisitions'), permissions: ['SECTION_SALES', 'MENU_SALES_PURCHASE_REQUISITIONS'] },
  { test: (p) => p.startsWith('/dashboard/sales/customer-requests'), permissions: ['SECTION_SALES', 'MENU_SALES_CUSTOMER_REQUESTS'] },
  { test: (p) => p.startsWith('/dashboard/sales/quotations'), permissions: ['SECTION_SALES', 'MENU_SALES_QUOTATIONS'] },
  { test: (p) => p.startsWith('/dashboard/sales/orders'), permissions: ['SECTION_SALES', 'MENU_SALES_ORDERS'] },
  { test: (p) => p.startsWith('/dashboard/sales/issue-notes'), permissions: ['SECTION_SALES', 'MENU_SALES_ISSUE_NOTES'] },
  { test: (p) => p.startsWith('/dashboard/sales/delivery-orders'), permissions: ['SECTION_SALES', 'MENU_SALES_DELIVERY_ORDERS'] },
  { test: (p) => p.startsWith('/dashboard/sales/vehicles'), permissions: ['SECTION_SALES', 'MENU_SALES_VEHICLES'] },
  { test: (p) => p.startsWith('/dashboard/sales/invoices'), permissions: ['SECTION_SALES', 'MENU_SALES_INVOICES'] },
  { test: (p) => p.startsWith('/dashboard/sales/receipts'), permissions: ['SECTION_SALES', 'MENU_SALES_RECEIPTS'] },
  { test: (p) => p.startsWith('/dashboard/sales'), permissions: ['SECTION_SALES'] },
  // العملاء (CRM) والمالية
  { test: (p) => p.startsWith('/dashboard/crm'), permissions: ['SECTION_CRM', 'MENU_CRM_CUSTOMERS'] },
  { test: (p) => p.startsWith('/dashboard/finance/payment-vouchers'), permissions: ['SECTION_FINANCE', 'MENU_FINANCE_PAYMENT_VOUCHERS', 'MENU_FINANCE_PAYMENT_VOUCHERS_NEW'] },
  { test: (p) => p.startsWith('/dashboard/finance/invoices'), permissions: ['SECTION_FINANCE', 'SUPPLIER_INVOICE_VIEW', 'MENU_FINANCE_INVOICES'] },
  { test: (p) => p.startsWith('/dashboard/finance'), permissions: ['SECTION_FINANCE'] },
  // المخازن والعمليات
  { test: (p) => p.startsWith('/dashboard/audit'), permissions: ['SECTION_MAIN'] },
  { test: (p) => p.startsWith('/dashboard/inventory/quality-inspection'), permissions: ['SECTION_OPERATIONS', 'MENU_OPERATIONS_QUALITY_INSPECTION'] },
  { test: (p) => p.startsWith('/dashboard/inventory/quality-parameters'), permissions: ['SECTION_OPERATIONS', 'MENU_OPERATIONS_QUALITY_PARAMETERS'] },
  { test: (p) => p.startsWith('/dashboard/inventory/categories'), permissions: ['SECTION_OPERATIONS', 'MENU_OPERATIONS_CATEGORIES'] },
  { test: (p) => p.startsWith('/dashboard/inventory/items'), permissions: ['SECTION_OPERATIONS', 'MENU_OPERATIONS_ITEMS'] },
  { test: (p) => p.startsWith('/dashboard/inventory/price-lists'), permissions: ['SECTION_OPERATIONS', 'MENU_OPERATIONS_PRICE_LISTS'] },
  { test: (p) => p.startsWith('/dashboard/inventory') && (p.includes('quality-inspection') || p.includes('quality-parameters') || p.includes('price-lists') || p.includes('categories') || p.includes('items')), permissions: ['SECTION_OPERATIONS'] },
  { test: (p) => p.startsWith('/dashboard/inventory/sections'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW', 'MENU_WAREHOUSE_SECTIONS'] },
  { test: (p) => p.startsWith('/dashboard/inventory/warehouses'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW', 'MENU_WAREHOUSE_WAREHOUSES'] },
  { test: (p) => p.startsWith('/dashboard/inventory/stocks'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW', 'MENU_WAREHOUSE_STOCKS'] },
  { test: (p) => p.startsWith('/dashboard/inventory/warehouse/issue'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW', 'MENU_WAREHOUSE_ISSUE'] },
  { test: (p) => p.startsWith('/dashboard/inventory/warehouse/transfer'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW', 'MENU_WAREHOUSE_TRANSFER'] },
  { test: (p) => p.startsWith('/dashboard/inventory/reports'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW', 'MENU_WAREHOUSE_BELOW_MIN', 'MENU_WAREHOUSE_STAGNANT', 'MENU_WAREHOUSE_MOVEMENT', 'MENU_WAREHOUSE_PERIODIC_INVENTORY', 'MENU_WAREHOUSE_VARIANCE'] },
  { test: (p) => p.startsWith('/dashboard/inventory/count'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW', 'MENU_WAREHOUSE_COUNT', 'MENU_WAREHOUSE_COUNT_SURPRISE'] },
  { test: (p) => p.startsWith('/dashboard/inventory'), permissions: ['SECTION_WAREHOUSE', 'INVENTORY_VIEW'] },
];

/** ربط المسار بصلاحية القسم (أول صلاحية في النمط). مُصدَّر للاختبارات. */
export function getRequiredPermissionForPath(path: string): string | null {
  if (pathRulesFromApi && pathRulesFromApi.length > 0) {
    const matching = pathRulesFromApi.filter((r) => antMatch(path, r.pathPattern));
    if (matching.length > 0) {
      const first = matching[0].permissionCode;
      return first === '__PUBLIC__' ? null : first;
    }
  }
  for (const { test, permissions } of PATH_PERMISSION_PATTERNS) {
    if (test(path)) {
      const first = permissions[0];
      return first === '__PUBLIC__' ? null : first;
    }
  }
  return null;
}

/**
 * يتحقق إن كان المستخدم يملك صلاحية الدخول للمسار.
 * إن وُجدت قواعد من الـ API (path-rules) تُستخدم أولاً؛ وإلا fallback إلى PATH_PERMISSION_PATTERNS.
 * يكفي أن يملك أي صلاحية من صلاحيات النمط (SECTION_* أو MENU_*).
 */
export function canAccessPath(
  path: string,
  _userRole: string,
  userPermissions?: string[] | null
): boolean {
  if (pathRulesFromApi && pathRulesFromApi.length > 0) {
    const matchingRules = pathRulesFromApi.filter((r) => antMatch(path, r.pathPattern));
    if (matchingRules.length > 0) {
      const allowedPermissions = [...new Set(matchingRules.map((r) => r.permissionCode))];
      if (allowedPermissions.includes('__PUBLIC__')) return true;
      const hasAny = allowedPermissions.some((perm) => userPermissions?.includes(perm));
      return hasAny;
    }
  }
  for (const { test, permissions } of PATH_PERMISSION_PATTERNS) {
    if (!test(path)) continue;
    if (permissions.includes('__PUBLIC__')) return true;
    const hasAny = permissions.some((perm) => userPermissions?.includes(perm));
    if (hasAny) return true;
    return false;
  }
  return false;
}
