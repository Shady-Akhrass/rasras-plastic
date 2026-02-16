-- Sales Approval Workflows Migration
-- Adds approval workflows for sales documents following the procurement pattern

-- Add approval workflows
INSERT INTO `approvalworkflows` (`WorkflowCode`, `WorkflowName`, `DocumentType`, `IsActive`, `CreatedAt`) VALUES
('SO_APPROVAL', 'Sales Order Approval', 'SalesOrder', 1, NOW()),
('QUOTATION_APPROVAL', 'Sales Quotation Approval', 'SalesQuotation', 1, NOW()),
('INVOICE_APPROVAL', 'Sales Invoice Approval', 'SalesInvoice', 1, NOW()),
('DELIVERY_APPROVAL', 'Delivery Order Approval', 'DeliveryOrder', 1, NOW()),
('ISSUE_NOTE_APPROVAL', 'Stock Issue Note Approval', 'StockIssueNote', 1, NOW()),
('RECEIPT_APPROVAL', 'Payment Receipt Approval', 'PaymentReceipt', 1, NOW());

-- Get workflow IDs (assuming they are auto-incremented)
SET @so_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'SO_APPROVAL');
SET @quotation_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'QUOTATION_APPROVAL');
SET @invoice_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'INVOICE_APPROVAL');
SET @delivery_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'DELIVERY_APPROVAL');
SET @issue_note_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'ISSUE_NOTE_APPROVAL');
SET @receipt_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'RECEIPT_APPROVAL');

-- Get role IDs (assuming Sales Manager = 6, Finance Manager = 3, General Manager = 2)
-- Adjust these based on your actual role IDs
SET @sales_manager_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'SALES_MANAGER' LIMIT 1);
SET @finance_manager_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'FINANCE_MANAGER' LIMIT 1);
SET @general_manager_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'GENERAL_MANAGER' LIMIT 1);

-- If roles don't exist, use default IDs (adjust based on your schema)
SET @sales_manager_role_id = IFNULL(@sales_manager_role_id, 6);
SET @finance_manager_role_id = IFNULL(@finance_manager_role_id, 3);
SET @general_manager_role_id = IFNULL(@general_manager_role_id, 2);

-- Sales Order Approval Steps (Sales Manager -> Finance Manager -> General Manager)
INSERT INTO `approvalworkflowsteps` (`WorkflowID`, `StepNumber`, `StepName`, `ApproverType`, `ApproverRoleID`, `MinAmount`, `MaxAmount`, `IsRequired`, `CanSkip`, `EscalationDays`, `IsActive`) VALUES
(@so_workflow_id, 1, 'Sales Manager Approval', 'ROLE', @sales_manager_role_id, NULL, NULL, 1, 0, 3, 1),
(@so_workflow_id, 2, 'Finance Manager Approval', 'ROLE', @finance_manager_role_id, NULL, NULL, 1, 0, 3, 1),
(@so_workflow_id, 3, 'General Manager Approval', 'ROLE', @general_manager_role_id, NULL, NULL, 1, 0, 3, 1);

-- Sales Quotation Approval Steps (Sales Manager only)
INSERT INTO `approvalworkflowsteps` (`WorkflowID`, `StepNumber`, `StepName`, `ApproverType`, `ApproverRoleID`, `MinAmount`, `MaxAmount`, `IsRequired`, `CanSkip`, `EscalationDays`, `IsActive`) VALUES
(@quotation_workflow_id, 1, 'Sales Manager Approval', 'ROLE', @sales_manager_role_id, NULL, NULL, 1, 0, 3, 1);

-- Sales Invoice Approval Steps (Finance Manager -> General Manager)
INSERT INTO `approvalworkflowsteps` (`WorkflowID`, `StepNumber`, `StepName`, `ApproverType`, `ApproverRoleID`, `MinAmount`, `MaxAmount`, `IsRequired`, `CanSkip`, `EscalationDays`, `IsActive`) VALUES
(@invoice_workflow_id, 1, 'Finance Manager Approval', 'ROLE', @finance_manager_role_id, NULL, NULL, 1, 0, 3, 1),
(@invoice_workflow_id, 2, 'General Manager Approval', 'ROLE', @general_manager_role_id, NULL, NULL, 1, 0, 3, 1);

-- Delivery Order Approval Steps (Warehouse Manager -> Sales Manager)
INSERT INTO `approvalworkflowsteps` (`WorkflowID`, `StepNumber`, `StepName`, `ApproverType`, `ApproverRoleID`, `MinAmount`, `MaxAmount`, `IsRequired`, `CanSkip`, `EscalationDays`, `IsActive`) VALUES
(@delivery_workflow_id, 1, 'Warehouse Manager Approval', 'ROLE', @sales_manager_role_id, NULL, NULL, 1, 0, 3, 1),
(@delivery_workflow_id, 2, 'Sales Manager Approval', 'ROLE', @sales_manager_role_id, NULL, NULL, 1, 0, 3, 1);

-- Stock Issue Note Approval Steps (Warehouse Manager -> Sales Manager)
INSERT INTO `approvalworkflowsteps` (`WorkflowID`, `StepNumber`, `StepName`, `ApproverType`, `ApproverRoleID`, `MinAmount`, `MaxAmount`, `IsRequired`, `CanSkip`, `EscalationDays`, `IsActive`) VALUES
(@issue_note_workflow_id, 1, 'Warehouse Manager Approval', 'ROLE', @sales_manager_role_id, NULL, NULL, 1, 0, 3, 1),
(@issue_note_workflow_id, 2, 'Sales Manager Approval', 'ROLE', @sales_manager_role_id, NULL, NULL, 1, 0, 3, 1);

-- Payment Receipt Approval Steps (Finance Manager -> General Manager)
INSERT INTO `approvalworkflowsteps` (`WorkflowID`, `StepNumber`, `StepName`, `ApproverType`, `ApproverRoleID`, `MinAmount`, `MaxAmount`, `IsRequired`, `CanSkip`, `EscalationDays`, `IsActive`) VALUES
(@receipt_workflow_id, 1, 'Finance Manager Approval', 'ROLE', @finance_manager_role_id, NULL, NULL, 1, 0, 3, 1),
(@receipt_workflow_id, 2, 'General Manager Approval', 'ROLE', @general_manager_role_id, NULL, NULL, 1, 0, 3, 1);

-- Add ApprovalStatus column to sales tables if not exists
ALTER TABLE `salesorders` ADD COLUMN IF NOT EXISTS `ApprovalStatus` VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE `salesquotations` ADD COLUMN IF NOT EXISTS `ApprovalStatus` VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE `salesinvoices` ADD COLUMN IF NOT EXISTS `ApprovalStatus` VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE `deliveryorders` ADD COLUMN IF NOT EXISTS `ApprovalStatus` VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE `stockissuenotes` ADD COLUMN IF NOT EXISTS `ApprovalStatus` VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE `receiptvouchers` ADD COLUMN IF NOT EXISTS `ApprovalStatus` VARCHAR(20) DEFAULT 'Pending';
