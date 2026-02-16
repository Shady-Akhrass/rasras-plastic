-- Emergency Security Patch: SECTION_FINANCE
-- Run this on existing DBs so FM and ACC get finance access without re-seeding.

-- 1. Insert SECTION_FINANCE permission if not exists
INSERT INTO permissions (PermissionCode, PermissionNameAr, PermissionNameEn, ModuleName, IsActive, CreatedAt)
SELECT 'SECTION_FINANCE', 'المالية والمحاسبة', 'Finance & Accounting', 'MENU', 1, NOW()
FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE PermissionCode = 'SECTION_FINANCE');

-- 2. Assign SECTION_FINANCE to ADMIN
INSERT INTO rolepermissions (RoleID, PermissionID, IsAllowed)
SELECT r.RoleID, p.PermissionID, 1
FROM roles r
CROSS JOIN permissions p
WHERE r.RoleCode = 'ADMIN' AND p.PermissionCode = 'SECTION_FINANCE'
  AND NOT EXISTS (
    SELECT 1 FROM rolepermissions rp
    WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID
  );

-- 3. Assign SECTION_FINANCE to GM
INSERT INTO rolepermissions (RoleID, PermissionID, IsAllowed)
SELECT r.RoleID, p.PermissionID, 1
FROM roles r
CROSS JOIN permissions p
WHERE r.RoleCode = 'GM' AND p.PermissionCode = 'SECTION_FINANCE'
  AND NOT EXISTS (
    SELECT 1 FROM rolepermissions rp
    WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID
  );

-- 4. Assign SECTION_FINANCE to FM (Finance Manager)
INSERT INTO rolepermissions (RoleID, PermissionID, IsAllowed)
SELECT r.RoleID, p.PermissionID, 1
FROM roles r
CROSS JOIN permissions p
WHERE r.RoleCode = 'FM' AND p.PermissionCode = 'SECTION_FINANCE'
  AND NOT EXISTS (
    SELECT 1 FROM rolepermissions rp
    WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID
  );

-- 5. Assign SECTION_FINANCE to ACC (Accountant)
INSERT INTO rolepermissions (RoleID, PermissionID, IsAllowed)
SELECT r.RoleID, p.PermissionID, 1
FROM roles r
CROSS JOIN permissions p
WHERE r.RoleCode = 'ACC' AND p.PermissionCode = 'SECTION_FINANCE'
  AND NOT EXISTS (
    SELECT 1 FROM rolepermissions rp
    WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID
  );
