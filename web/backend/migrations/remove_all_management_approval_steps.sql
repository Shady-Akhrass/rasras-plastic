-- ============================================================
-- Migration: Remove ALL "Management Approval" Steps from ALL Workflows
-- ============================================================
-- التاريخ: 2026-02-14
-- الهدف: حذف جميع خطوات "Management Approval" الزائدة من جميع workflows
-- السبب: WorkflowDataSeeder.java كان ي إضافة خطوات خاطئة
-- ============================================================

SELECT '============================================================' AS '';
SELECT 'MIGRATION: Remove ALL Management Approval Steps' AS '';
SELECT '============================================================' AS '';

-- ============================================================
-- Step 1: عرض جميع خطوات "Management Approval" الموجودة حالياً
-- ============================================================
SELECT '──────────────────────────────────────────────' AS '';
SELECT 'Step 1: Current "Management Approval" Steps' AS 'Stage';
SELECT '──────────────────────────────────────────────' AS '';

SELECT 
    aw.WorkflowCode,
    aw.WorkflowName,
    aws.StepID,
    aws.StepNumber,
    aws.StepName,
    r.RoleCode,
    r.RoleNameAr,
    '⚠️ TO BE DELETED' AS 'Action'
FROM approvalworkflowsteps aws
INNER JOIN approvalworkflows aw ON aws.WorkflowID = aw.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aws.StepName = 'Management Approval'
  AND aws.StepName != 'General Manager Approval'
  AND aws.StepName != 'Finance Manager Approval'
  AND aws.StepName != 'Procurement Manager Approval'
ORDER BY aw.WorkflowCode, aws.StepNumber;

SELECT 
    CONCAT('Found ', COUNT(*), ' "Management Approval" step(s) to delete') AS 'Summary'
FROM approvalworkflowsteps aws
WHERE aws.StepName = 'Management Approval'
  AND aws.StepName != 'General Manager Approval'
  AND aws.StepName != 'Finance Manager Approval'
  AND aws.StepName != 'Procurement Manager Approval';

-- ============================================================
-- Step 2: فحص الطلبات المعلقة المتأثرة
-- ============================================================
SELECT '──────────────────────────────────────────────' AS '';
SELECT 'Step 2: Checking Affected Pending Requests' AS 'Stage';
SELECT '──────────────────────────────────────────────' AS '';

SELECT 
    ar.RequestID,
    aw.WorkflowCode,
    ar.DocumentType,
    ar.DocumentNumber,
    ar.Status,
    aws.StepName AS 'Current Step',
    '⚠️ Will be reset' AS 'Action'
FROM approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
LEFT JOIN approvalworkflowsteps aws ON ar.CurrentStepID = aws.StepID
WHERE ar.CurrentStepID IN (
    SELECT StepID 
    FROM approvalworkflowsteps 
    WHERE StepName = 'Management Approval'
      AND StepName != 'General Manager Approval'
      AND StepName != 'Finance Manager Approval'
      AND StepName != 'Procurement Manager Approval'
)
AND ar.Status IN ('Pending', 'InProgress');

SELECT 
    CONCAT('Found ', COUNT(*), ' pending request(s) to reset') AS 'Summary'
FROM approvalrequests ar
WHERE ar.CurrentStepID IN (
    SELECT StepID 
    FROM approvalworkflowsteps 
    WHERE StepName = 'Management Approval'
      AND StepName != 'General Manager Approval'
      AND StepName != 'Finance Manager Approval'
      AND StepName != 'Procurement Manager Approval'
)
AND ar.Status IN ('Pending', 'InProgress');

-- ============================================================
-- Step 3: إعادة تعيين/إزالة CurrentStepID من الطلبات المتأثرة
-- ============================================================
SELECT '──────────────────────────────────────────────' AS '';
SELECT 'Step 3: Clearing CurrentStepID from Affected Requests' AS 'Stage';
SELECT '──────────────────────────────────────────────' AS '';

-- إزالة CurrentStepID من الطلبات التي تشير للخطوات المحذوفة
-- سيتم إعادتها للخطوة الأولى تلقائياً عند إعادة الإرسال
UPDATE approvalrequests
SET 
    CurrentStepID = NULL,
    Status = CASE 
        WHEN Status IN ('Pending', 'InProgress') THEN 'Pending'
        ELSE Status
    END
WHERE CurrentStepID IN (
    SELECT StepID 
    FROM approvalworkflowsteps 
    WHERE StepName = 'Management Approval'
      AND StepName != 'General Manager Approval'
      AND StepName != 'Finance Manager Approval'
      AND StepName != 'Procurement Manager Approval'
);

SELECT ROW_COUNT() AS '✅ Requests cleared (CurrentStepID set to NULL)';

-- ============================================================
-- Step 4A: حذف ApprovalActions المرتبطة بخطوات "Management Approval"
-- ============================================================
SELECT '──────────────────────────────────────────────' AS '';
SELECT 'Step 4A: Deleting Related ApprovalActions' AS 'Stage';
SELECT '──────────────────────────────────────────────' AS '';

-- عرض الإجراءات التي سيتم حذفها
SELECT 
    aa.ActionID,
    aw.WorkflowCode,
    aws.StepName,
    aa.ActionType,
    aa.ActionDate,
    '⚠️ TO BE DELETED' AS 'Action'
FROM approvalactions aa
INNER JOIN approvalworkflowsteps aws ON aa.StepID = aws.StepID
INNER JOIN approvalworkflows aw ON aws.WorkflowID = aw.WorkflowID
WHERE aws.StepName = 'Management Approval'
  AND aws.StepName != 'General Manager Approval'
  AND aws.StepName != 'Finance Manager Approval'
  AND aws.StepName != 'Procurement Manager Approval';

-- حذف الإجراءات المرتبطة
DELETE FROM approvalactions
WHERE StepID IN (
    SELECT StepID 
    FROM approvalworkflowsteps 
    WHERE StepName = 'Management Approval'
      AND StepName != 'General Manager Approval'
      AND StepName != 'Finance Manager Approval'
      AND StepName != 'Procurement Manager Approval'
);

SELECT ROW_COUNT() AS '✅ ApprovalActions deleted';

-- ============================================================
-- Step 4B: حذف جميع خطوات "Management Approval" الزائدة
-- ============================================================
SELECT '──────────────────────────────────────────────' AS '';
SELECT 'Step 4B: Deleting "Management Approval" Steps' AS 'Stage';
SELECT '──────────────────────────────────────────────' AS '';

DELETE FROM approvalworkflowsteps
WHERE StepName = 'Management Approval'
  AND StepName != 'General Manager Approval'
  AND StepName != 'Finance Manager Approval'
  AND StepName != 'Procurement Manager Approval';

SELECT ROW_COUNT() AS '✅ Management Approval steps deleted';

-- ============================================================
-- Step 5: عرض جميع Workflows بعد التنظيف
-- ============================================================
SELECT '──────────────────────────────────────────────' AS '';
SELECT 'Step 5: All Workflows After Cleanup' AS 'Stage';
SELECT '──────────────────────────────────────────────' AS '';

SELECT 
    aw.WorkflowCode,
    aw.WorkflowName,
    aws.StepNumber,
    aws.StepName,
    r.RoleCode,
    r.RoleNameAr
FROM approvalworkflows aw
LEFT JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aw.WorkflowCode IN ('PO_APPROVAL', 'QC_APPROVAL', 'PR_APPROVAL', 'GRN_APPROVAL', 'PV_APPROVAL')
ORDER BY aw.WorkflowCode, aws.StepNumber;

-- ============================================================
-- Step 6: التحقق النهائي - يجب ألا توجد "Management Approval"
-- ============================================================
SELECT '──────────────────────────────────────────────' AS '';
SELECT 'Step 6: Final Verification' AS 'Stage';
SELECT '──────────────────────────────────────────────' AS '';

SELECT 
    CASE 
        WHEN COUNT(*) = 0 
        THEN '✅ SUCCESS: No "Management Approval" steps found'
        ELSE CONCAT('❌ ERROR: Still found ', COUNT(*), ' "Management Approval" step(s)')
    END AS 'Verification Result'
FROM approvalworkflowsteps
WHERE StepName = 'Management Approval'
  AND StepName != 'General Manager Approval'
  AND StepName != 'Finance Manager Approval'
  AND StepName != 'Procurement Manager Approval';

-- عرض أي خطوات متبقية (يجب أن تكون 0)
SELECT 
    aw.WorkflowCode,
    aws.StepName,
    '❌ Still exists!' AS 'Issue'
FROM approvalworkflowsteps aws
INNER JOIN approvalworkflows aw ON aws.WorkflowID = aw.WorkflowID
WHERE aws.StepName = 'Management Approval'
  AND aws.StepName != 'General Manager Approval'
  AND aws.StepName != 'Finance Manager Approval'
  AND aws.StepName != 'Procurement Manager Approval';

-- ============================================================
-- Summary
-- ============================================================
SELECT '============================================================' AS '';
SELECT 'MIGRATION COMPLETED' AS 'Status';
SELECT '============================================================' AS '';

SELECT 'All "Management Approval" steps have been removed.' AS 'Result';
SELECT 'Affected pending requests have been reset to first step.' AS 'Note';
SELECT 'WorkflowDataSeeder.java has been disabled in code.' AS 'Code Change';

SELECT '============================================================' AS '';
