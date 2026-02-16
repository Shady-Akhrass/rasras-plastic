/**
 * أكواد الأدوار — مصدر حقيقة مركزية لتجنب Strings مبعثرة في الكود.
 * يجب استخدام هذه الثوابت بدلاً من النصوص الحرفية مثل "FM", "ACC".
 */
export const ROLE_CODES = {
  ADMIN: 'ADMIN',
  SYS_ADMIN: 'SYS_ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  GM: 'GM',
  /** المدير المالي */
  FINANCE_MANAGER: 'FM',
  /** المحاسب */
  ACCOUNTANT: 'ACC',
  /** مدير المشتريات */
  PROCUREMENT_MANAGER: 'PM',
  /** مشتري */
  BUYER: 'BUYER',
  /** مدير المبيعات */
  SALES_MANAGER: 'SM',
  /** أمين المخزن */
  WAREHOUSE_KEEPER: 'WHM',
  /** مراقب الجودة */
  QUALITY_CONTROLLER: 'QC',
  MANAGER: 'MANAGER',
  HR: 'HR',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];
