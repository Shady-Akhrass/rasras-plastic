-- SQL Migration to set up Quotation Comparison Approval Workflow

-- 1. Create Workflow
INSERT INTO approvalworkflows (WorkflowCode, WorkflowName, DocumentType, Description, CreatedAt, IsActive)
VALUES ('QC_APPROVAL', 'اعتماد مقارنة العروض', 'QuotationComparison', 'دورة اعتماد اختيار المورد الفائز في مقارنة العروض', NOW(), 1);

-- 2. Create Steps (e.g., Finance Review -> Management Approval)
SET @workflow_id = LAST_INSERT_ID();

-- Step 1: Finance Review
INSERT INTO approvalworkflowsteps (WorkflowID, StepOrder, StepName, ApproverRole, RequiredApprovals, CanReject, CreatedAt)
VALUES (@workflow_id, 1, 'مراجعة قسم المالية', 'FinanceManager', 1, 1, NOW());

-- Step 2: Management Approval
INSERT INTO approvalworkflowsteps (WorkflowID, StepOrder, StepName, ApproverRole, RequiredApprovals, CanReject, CreatedAt)
VALUES (@workflow_id, 2, 'اعتماد الإدارة', 'GeneralManager', 1, 1, NOW());

-- 3. Ensure document types are configured
UPDATE documenttypes SET RequiresApproval = 1 WHERE DocumentTypeCode = 'QC';
UPDATE documenttypes SET RequiresApproval = 0 WHERE DocumentTypeCode = 'PO'; -- Bypass PO approval
