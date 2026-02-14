-- ============================================================
-- تحليل خطوات اعتماد طلب المقارنة (QC_APPROVAL)
-- ============================================================
-- الهدف: عرض جميع الخطوات الحالية لـ QC_APPROVAL workflow
-- للتأكد من وجود خطوة زائدة تحتاج للحذف
-- ============================================================

SET @qc_workflow_id = NULL;

-- 1. الحصول على معرف workflow QC_APPROVAL
SELECT 'Step 1: Getting QC_APPROVAL Workflow ID...' AS 'Stage';
SELECT @qc_workflow_id := WorkflowID 
FROM approvalworkflows 
WHERE WorkflowCode = 'QC_APPROVAL';

SELECT 
    CASE 
        WHEN @qc_workflow_id IS NOT NULL 
        THEN CONCAT('✅ QC_APPROVAL Workflow found with ID: ', @qc_workflow_id)
        ELSE '❌ QC_APPROVAL Workflow NOT found!'
    END AS 'Result';

-- ============================================================
-- 2. عرض معلومات الـ workflow
-- ============================================================
SELECT 'Step 2: QC_APPROVAL Workflow Details' AS 'Stage';
SELECT 
    WorkflowID,
    WorkflowCode,
    WorkflowName,
    DocumentType,
    IsActive,
    CreatedAt
FROM approvalworkflows 
WHERE WorkflowCode = 'QC_APPROVAL';

-- ============================================================
-- 3. عرض جميع الخطوات الحالية مرتبة حسب StepNumber
-- ============================================================
SELECT 'Step 3: Current Workflow Steps (Ordered by StepNumber)' AS 'Stage';
SELECT 
    aws.StepID,
    aws.StepNumber,
    aws.StepName,
    aws.ApproverType,
    aws.ApproverRoleID,
    r.RoleCode,
    r.RoleNameAr,
    r.RoleNameEn,
    aws.IsRequired,
    aws.CanSkip,
    aws.IsActive
FROM approvalworkflowsteps aws
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aws.WorkflowID = @qc_workflow_id
ORDER BY aws.StepNumber ASC;

-- ============================================================
-- 4. عرض عدد الخطوات
-- ============================================================
SELECT 'Step 4: Total Number of Steps' AS 'Stage';
SELECT COUNT(*) AS 'Total Steps'
FROM approvalworkflowsteps
WHERE WorkflowID = @qc_workflow_id;

-- ============================================================
-- 5. البحث عن خطوة "Management Approval"
-- ============================================================
SELECT 'Step 5: Looking for Extra "Management Approval" Step' AS 'Stage';
SELECT 
    StepID,
    StepNumber,
    StepName,
    ApproverRoleID
FROM approvalworkflowsteps
WHERE WorkflowID = @qc_workflow_id
  AND StepName LIKE '%Management Approval%';

-- ============================================================
-- 6. فحص الطلبات المعلقة التي تشير لأي خطوة في QC_APPROVAL
-- ============================================================
SELECT 'Step 6: Pending Approval Requests for QC_APPROVAL' AS 'Stage';
SELECT 
    ar.RequestID,
    ar.DocumentType,
    ar.DocumentID,
    ar.DocumentNumber,
    ar.Status,
    ar.CurrentStepID,
    aws.StepNumber,
    aws.StepName,
    ar.RequestedDate
FROM approvalrequests ar
LEFT JOIN approvalworkflowsteps aws ON ar.CurrentStepID = aws.StepID
WHERE ar.WorkflowID = @qc_workflow_id
  AND ar.Status IN ('Pending', 'InProgress')
ORDER BY ar.RequestedDate DESC;

-- ============================================================
-- 7. عرض تاريخ الاعتمادات (آخر 10 طلبات)
-- ============================================================
SELECT 'Step 7: Recent Approval History (Last 10 Requests)' AS 'Stage';
SELECT 
    ar.RequestID,
    ar.DocumentNumber,
    ar.Status,
    ar.RequestedDate,
    ar.CompletedDate,
    aws.StepNumber AS 'Current/Final Step',
    aws.StepName
FROM approvalrequests ar
LEFT JOIN approvalworkflowsteps aws ON ar.CurrentStepID = aws.StepID
WHERE ar.WorkflowID = @qc_workflow_id
ORDER BY ar.RequestedDate DESC
LIMIT 10;

-- ============================================================
-- 8. التوصيات
-- ============================================================
SELECT 'Step 8: Recommendations' AS 'Stage';
SELECT 
    CONCAT('Expected Steps: 3 (PM → FM → GM)') AS 'Info',
    CONCAT('Actual Steps: ', COUNT(*)) AS 'Current Count'
FROM approvalworkflowsteps
WHERE WorkflowID = @qc_workflow_id;

SELECT '============================================================' AS '';
SELECT 'Analysis Complete!' AS 'Status';
SELECT '============================================================' AS '';
