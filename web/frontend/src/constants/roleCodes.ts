/**
 * Central role code constants — matches backend roles table (RoleCode).
 * Use these instead of string literals for consistency (see doc/توثيق_الصلاحيات.md).
 */
export const ROLE_CODES = {
  ADMIN: 'ADMIN',
  SYS_ADMIN: 'SYS_ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  GM: 'GM',
  FINANCE_MANAGER: 'FM',
  ACCOUNTANT: 'ACC',
  PROCUREMENT_MANAGER: 'PM',
  BUYER: 'BUYER',
  SALES_MANAGER: 'SM',
  WAREHOUSE_KEEPER: 'WHM',
  QUALITY_CONTROLLER: 'QC',
  MANAGER: 'MANAGER',
  HR: 'HR',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];
