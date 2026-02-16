/**
 * Permission Coverage Test — يتأكد أن كل مسارات /dashboard/* المحمية مربوطة بصلاحية SECTION.
 * تشغيل: npx vite run src/utils/permissionCoverage.ts (أو دمج في CI).
 */

import { getRequiredPermissionForPath } from './permissionUtils';

/** مسارات أو بادئات مسارات يجب أن تكون محمية بصلاحية قسم (لا تُعاد للعامة) */
const DASHBOARD_PATHS_REQUIRING_SECTION = [
  '/dashboard/users',
  '/dashboard/employees',
  '/dashboard/hr',
  '/dashboard/audit',
  '/dashboard/settings',
  '/dashboard/procurement',
  '/dashboard/sales',
  '/dashboard/crm',
  '/dashboard/finance',
  '/dashboard/inventory',
] as const;

export function runPermissionCoverageCheck(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const path of DASHBOARD_PATHS_REQUIRING_SECTION) {
    const section = getRequiredPermissionForPath(path);
    if (section == null) {
      missing.push(path);
    }
  }
  return { ok: missing.length === 0, missing };
}

export function assertAllDashboardPathsHaveSection(): void {
  const { ok, missing } = runPermissionCoverageCheck();
  if (!ok) {
    throw new Error(
      `Permission coverage failed: the following dashboard paths are not mapped to a SECTION: ${missing.join(', ')}. ` +
        'Add them in permissionUtils.getRequiredPermissionForPath().'
    );
  }
}
