-- Migration: Add missing inventory permissions (INVENTORY_CREATE, INVENTORY_UPDATE, INVENTORY_DELETE)
-- Run this SQL in your MySQL database to fix the 403 Forbidden error when updating items

-- Add missing inventory permissions (using INSERT IGNORE to avoid duplicates)
INSERT IGNORE INTO `permissions` (`PermissionCode`, `PermissionNameAr`, `PermissionNameEn`, `ModuleName`, `ActionType`, `Description`, `IsActive`) VALUES
('INVENTORY_CREATE', 'إنشاء صنف', 'Create Item', 'Inventory', 'Create', 'إنشاء أصناف جديدة في المخزون', 1),
('INVENTORY_UPDATE', 'تعديل صنف', 'Update Item', 'Inventory', 'Edit', 'تعديل بيانات الأصناف في المخزون', 1),
('INVENTORY_DELETE', 'حذف صنف', 'Delete Item', 'Inventory', 'Delete', 'حذف الأصناف من المخزون', 1);

-- Grant these permissions to ADMIN role (RoleID = 1)
-- This will only insert if the permission doesn't already exist for the role
INSERT INTO `rolepermissions` (`RoleID`, `PermissionID`, `IsAllowed`)
SELECT 1, `PermissionID`, 1
FROM `permissions`
WHERE `PermissionCode` IN ('INVENTORY_CREATE', 'INVENTORY_UPDATE', 'INVENTORY_DELETE')
AND NOT EXISTS (
    SELECT 1 FROM `rolepermissions` rp 
    WHERE rp.`RoleID` = 1 
    AND rp.`PermissionID` = `permissions`.`PermissionID`
);
