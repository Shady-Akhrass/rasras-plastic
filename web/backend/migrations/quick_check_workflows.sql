-- ============================================================
-- فحص سريع لجميع خطوات الاعتماد
-- ============================================================

SELECT '════════════════════════════════════════' AS '';
SELECT 'QC_APPROVAL Workflow Steps' AS 'Workflow';
SELECT '════════════════════════════════════════' AS '';

SELECT 
    aws.StepNumber AS 'رقم',
    aws.StepName AS 'اسم الخطوة',
    r.RoleCode AS 'الدور',
    r.RoleNameAr AS 'اسم الدور'
FROM approvalworkflowsteps aws
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aws.WorkflowID = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL')
ORDER BY aws.StepNumber;

SELECT '════════════════════════════════════════' AS '';
SELECT 'PO_APPROVAL Workflow Steps' AS 'Workflow';
SELECT '════════════════════════════════════════' AS '';

SELECT 
    aws.StepNumber AS 'رقم',
    aws.StepName AS 'اسم الخطوة',
    r.RoleCode AS 'الدور',
    r.RoleNameAr AS 'اسم الدور'
FROM approvalworkflowsteps aws
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aws.WorkflowID = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'PO_APPROVAL')
ORDER BY aws.StepNumber;

SELECT '════════════════════════════════════════' AS '';
SELECT 'جميع الخطوات التي تحتوي على "Management Approval"' AS 'بحث';
SELECT '════════════════════════════════════════' AS '';

SELECT 
    aw.WorkflowCode AS 'الـ Workflow',
    aw.WorkflowName AS 'اسم سير العمل',
    aws.StepNumber AS 'رقم الخطوة',
    aws.StepName AS 'اسم الخطوة',
    r.RoleCode AS 'الدور'
FROM approvalworkflowsteps aws
INNER JOIN approvalworkflows aw ON aws.WorkflowID = aw.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aws.StepName LIKE '%Management Approval%'
ORDER BY aw.WorkflowCode, aws.StepNumber;
