
import { describe, it, expect } from 'vitest';
import { runPermissionCoverageCheck, assertAllDashboardPathsHaveSection } from './permissionCoverage';
import { getRequiredPermissionForPath } from './permissionUtils';

describe('Permission Coverage', () => {
  it('every protected dashboard path prefix is mapped to a SECTION', () => {
    const { ok, missing } = runPermissionCoverageCheck();
    expect(missing, `Paths without SECTION: ${missing.join(', ')}`).toEqual([]);
    expect(ok).toBe(true);
  });

  it('assertAllDashboardPathsHaveSection does not throw', () => {
    expect(() => assertAllDashboardPathsHaveSection()).not.toThrow();
  });

  it('finance path is protected (SECTION_FINANCE)', () => {
    expect(getRequiredPermissionForPath('/dashboard/finance')).toBe('SECTION_FINANCE');
    expect(getRequiredPermissionForPath('/dashboard/finance/payment-vouchers')).toBe('SECTION_FINANCE');
  });

  it('public paths do not require a section', () => {
    expect(getRequiredPermissionForPath('/dashboard')).toBeNull();
    expect(getRequiredPermissionForPath('/dashboard/approvals')).toBeNull();
    expect(getRequiredPermissionForPath('/dashboard/profile')).toBeNull();
  });
});
