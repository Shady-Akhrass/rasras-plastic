-- Migration Script: Update Approval Workflows for Quality Controller Role
-- Date: 2026-02-13
-- Description: 
--   1. Add QC (Quality Controller) role if not exists
--   2. Update GRN_APPROVAL workflow to add Quality Controller step before Procurement Manager
--   3. Update RET_APPROVAL workflow to use Quality Controller instead of Procurement Manager

-- ============================================================
-- 1. Add QC Role (if not exists)
-- ============================================================
INSERT INTO roles (RoleCode, RoleNameAr, RoleNameEn, Description, IsActive, CreatedAt)
SELECT 'QC', 'مراقب الجودة', 'Quality Controller', 'فحص واعتماد الجودة', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE RoleCode = 'QC');

-- ============================================================
-- 2. Add SECTION_OPERATIONS permission to QC role
-- ============================================================
INSERT INTO rolepermissions (RoleID, PermissionID, IsAllowed, CreatedAt)
SELECT r.RoleID, p.PermissionID, 1, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.RoleCode = 'QC' 
  AND p.PermissionCode IN ('SECTION_MAIN', 'SECTION_OPERATIONS')
  AND NOT EXISTS (
    SELECT 1 FROM rolepermissions rp 
    WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID
  );

-- ============================================================
-- 3. Update GRN_APPROVAL Workflow Steps
-- ============================================================

-- Get the workflow ID
SET @grn_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'GRN_APPROVAL');
SET @qc_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'QC');
SET @pm_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'PM');

-- Delete existing steps for GRN workflow
DELETE FROM approvalworkflowsteps WHERE WorkflowID = @grn_workflow_id;

-- Add Step 1: Quality Controller Approval
INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverType, ApproverRoleID, CreatedAt)
VALUES (@grn_workflow_id, 1, 'Quality Controller Approval', 'ROLE', @qc_role_id, NOW());

-- Add Step 2: Procurement Manager Approval
INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverType, ApproverRoleID, CreatedAt)
VALUES (@grn_workflow_id, 2, 'Procurement Manager Approval', 'ROLE', @pm_role_id, NOW());

-- ============================================================
-- 4. Update RET_APPROVAL (Purchase Return) Workflow Steps
-- ============================================================

-- Get the workflow ID
SET @ret_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'RET_APPROVAL');

-- Delete existing steps for Return workflow
DELETE FROM approvalworkflowsteps WHERE WorkflowID = @ret_workflow_id;

-- Add Step 1: Quality Controller Approval (instead of PM)
INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverType, ApproverRoleID, CreatedAt)
VALUES (@ret_workflow_id, 1, 'Quality Controller Approval', 'ROLE', @qc_role_id, NOW());

-- ============================================================
-- IMPORTANT: Update existing pending approval requests
-- ============================================================

-- Update pending GRN approvals to start with QC step (step 1)
UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
INNER JOIN approvalworkflowsteps aws ON aws.WorkflowID = aw.WorkflowID AND aws.StepNumber = 1
SET ar.CurrentStepID = aws.StepID
WHERE aw.WorkflowCode = 'GRN_APPROVAL' 
  AND ar.Status IN ('Pending', 'InProgress');

-- Update pending Purchase Return approvals to use QC step
UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
INNER JOIN approvalworkflowsteps aws ON aws.WorkflowID = aw.WorkflowID AND aws.StepNumber = 1
SET ar.CurrentStepID = aws.StepID
WHERE aw.WorkflowCode = 'RET_APPROVAL' 
  AND ar.Status IN ('Pending', 'InProgress');

-- ============================================================
-- Verification Query (Run this to verify changes)
-- ============================================================
-- SELECT 
--     aw.WorkflowCode,
--     aw.WorkflowName,
--     aws.StepNumber,
--     aws.StepName,
--     r.RoleCode,
--     r.RoleNameAr
-- FROM approvalworkflows aw
-- INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
-- LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
-- WHERE aw.WorkflowCode IN ('GRN_APPROVAL', 'RET_APPROVAL')
-- ORDER BY aw.WorkflowCode, aws.StepNumber;
