-- ============================================================
-- Precheck Script: QC Approval Workflow Update
-- ============================================================
-- التاريخ: 2026-02-14
-- الهدف: فحص النظام قبل تطبيق تحديثات workflow
-- 
-- ⚠️ مهم جداً:
--   لا تشغل apply_qc_approval_workflow.sql إلا إذا كانت النتيجة:
--   ✅ ALL CHECKS PASSED - SAFE TO PROCEED
-- ============================================================

-- ⚠️ IMPORTANT: Select the correct database
USE erp_db;

SET @check_passed = 1;

-- ============================================================
-- Check 1: التحقق من وجود الأدوار المطلوبة (PM, FM, GM)
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'CHECK 1: Required Roles Verification' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    r.RoleCode,
    r.RoleNameAr,
    r.RoleNameEn,
    CASE 
        WHEN r.RoleID IS NOT NULL THEN '✅ موجود'
        ELSE '❌ غير موجود'
    END AS 'Status'
FROM (
    SELECT 'PM' AS required_code UNION ALL
    SELECT 'FM' UNION ALL
    SELECT 'GM'
) req
LEFT JOIN roles r ON r.RoleCode = req.required_code
ORDER BY req.required_code;

-- فحص الفشل
SELECT @check_passed := CASE 
    WHEN (SELECT COUNT(*) FROM roles WHERE RoleCode IN ('PM', 'FM', 'GM')) = 3 
    THEN @check_passed 
    ELSE 0 
END;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM roles WHERE RoleCode IN ('PM', 'FM', 'GM')) = 3
        THEN '✅ PASS: All required roles exist'
        ELSE '❌ FAIL: Missing roles! Cannot proceed.'
    END AS 'Check Result';

-- ============================================================
-- Check 2: التحقق من وجود QC_APPROVAL Workflow
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'CHECK 2: QC_APPROVAL Workflow Verification' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    WorkflowID,
    WorkflowCode,
    WorkflowName,
    '✅ موجود' AS 'Status'
FROM approvalworkflows 
WHERE WorkflowCode = 'QC_APPROVAL'
UNION ALL
SELECT 
    NULL,
    'QC_APPROVAL',
    NULL,
    '❌ غير موجود - خطأ حرج!'
WHERE NOT EXISTS (SELECT 1 FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL');

-- فحص الفشل
SELECT @check_passed := CASE 
    WHEN EXISTS (SELECT 1 FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL')
    THEN @check_passed 
    ELSE 0 
END;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL')
        THEN '✅ PASS: QC_APPROVAL workflow exists'
        ELSE '❌ FAIL: QC_APPROVAL workflow not found!'
    END AS 'Check Result';

-- ============================================================
-- Check 3: عرض الخطوات الحالية في QC_APPROVAL
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'CHECK 3: Current QC_APPROVAL Steps' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    aws.StepNumber,
    aws.StepName,
    r.RoleCode,
    r.RoleNameAr,
    CONCAT('StepID: ', aws.StepID) AS 'Details'
FROM approvalworkflows aw
INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aw.WorkflowCode = 'QC_APPROVAL'
ORDER BY aws.StepNumber;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM approvalworkflows aw 
              INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID 
              WHERE aw.WorkflowCode = 'QC_APPROVAL') > 0
        THEN CONCAT('ℹ️ INFO: Found ', 
                    (SELECT COUNT(*) FROM approvalworkflows aw 
                     INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID 
                     WHERE aw.WorkflowCode = 'QC_APPROVAL'), 
                    ' existing step(s) - will be replaced')
        ELSE 'ℹ️ INFO: No existing steps found (empty workflow)'
    END AS 'Check Result';

-- ============================================================
-- Check 4: عرض الطلبات المتأثرة (Pending/InProgress)
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'CHECK 4: Affected Approval Requests (Pending/InProgress)' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    ar.RequestID,
    ar.DocumentType,
    ar.DocumentNumber,
    ar.Status,
    ar.RequestedDate,
    CASE 
        WHEN ar.CurrentStepID IS NOT NULL THEN CONCAT('StepID: ', ar.CurrentStepID)
        ELSE 'NULL'
    END AS 'CurrentStep'
FROM approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
WHERE aw.WorkflowCode = 'QC_APPROVAL'
  AND ar.DocumentType IN ('QuotationComparison', 'QC')
  AND ar.Status IN ('Pending', 'InProgress')
ORDER BY ar.RequestedDate DESC
LIMIT 10;

SELECT 
    CONCAT('ℹ️ INFO: Found ', 
           COUNT(*), 
           ' pending/in-progress request(s) - will be closed and set to Rejected') AS 'Check Result'
FROM approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
WHERE aw.WorkflowCode = 'QC_APPROVAL'
  AND ar.DocumentType IN ('QuotationComparison', 'QC')
  AND ar.Status IN ('Pending', 'InProgress');

-- ============================================================
-- Check 5: عرض المقارنات المرفوضة (سيتم إرجاعها لـ Draft)
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'CHECK 5: Rejected Comparisons (will be reset to Draft)' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    qc.ComparisonID,
    qc.ComparisonNumber,
    qc.Status,
    qc.ApprovalStatus,
    qc.CreatedAt,
    CASE 
        WHEN EXISTS (SELECT 1 FROM purchaseorders po 
                     WHERE po.QuotationID = qc.SelectedQuotationID
                        OR (po.PRID IS NOT NULL AND qc.PRID IS NOT NULL AND po.PRID = qc.PRID))
        THEN '⚠️ Has PO - Will NOT be reset'
        ELSE '✅ No PO - Will be reset to Draft'
    END AS 'Action'
FROM quotationcomparisons qc
WHERE qc.Status = 'Rejected'
  AND (qc.ApprovalStatus = 'Rejected' OR qc.ApprovalStatus IS NULL OR qc.ApprovalStatus = 'Pending')
ORDER BY qc.CreatedAt DESC
LIMIT 10;

SELECT 
    CONCAT('ℹ️ INFO: Found ', 
           COUNT(*), 
           ' rejected comparison(s) without PO - will be reset to Draft') AS 'Check Result'
FROM quotationcomparisons qc
WHERE qc.Status = 'Rejected'
  AND (qc.ApprovalStatus = 'Rejected' OR qc.ApprovalStatus IS NULL OR qc.ApprovalStatus = 'Pending')
  AND NOT EXISTS (
    SELECT 1 FROM purchaseorders po 
    WHERE po.QuotationID = qc.SelectedQuotationID
       OR (po.PRID IS NOT NULL AND qc.PRID IS NOT NULL AND po.PRID = qc.PRID)
  );

-- ============================================================
-- Check 6: التحقق من وجود أعمدة RejectionTracking
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'CHECK 6: Rejection Tracking Columns in quotationcomparisons' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CASE 
        WHEN COLUMN_NAME IN ('RejectionCount', 'LastRejectionDate', 'RejectionReason')
        THEN '✅ موجود'
        ELSE 'ℹ️ عمود آخر'
    END AS 'Status'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'quotationcomparisons'
  AND COLUMN_NAME IN ('RejectionCount', 'LastRejectionDate', 'RejectionReason')
UNION ALL
SELECT 
    req.col AS COLUMN_NAME,
    'N/A' AS COLUMN_TYPE,
    'N/A' AS IS_NULLABLE,
    'N/A' AS COLUMN_DEFAULT,
    '❌ غير موجود - يجب تشغيل add_rejection_tracking_columns.sql أولاً!' AS 'Status'
FROM (
    SELECT 'RejectionCount' AS col UNION ALL
    SELECT 'LastRejectionDate' UNION ALL
    SELECT 'RejectionReason'
) req
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'quotationcomparisons'
      AND COLUMN_NAME = req.col
)
ORDER BY COLUMN_NAME;

-- فحص الفشل
SELECT @check_passed := CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'quotationcomparisons'
            AND COLUMN_NAME IN ('RejectionCount', 'LastRejectionDate', 'RejectionReason')) = 3
    THEN @check_passed 
    ELSE 0 
END;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'quotationcomparisons'
                AND COLUMN_NAME IN ('RejectionCount', 'LastRejectionDate', 'RejectionReason')) = 3
        THEN '✅ PASS: All rejection tracking columns exist'
        ELSE '❌ FAIL: Missing rejection tracking columns! Run add_rejection_tracking_columns.sql first.'
    END AS 'Check Result';

-- ============================================================
-- Check 7: فحص Foreign Key بين approvalactions و approvalworkflowsteps
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'CHECK 7: Foreign Key Constraint Check (approvalactions.StepID)' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'approvalactions'
  AND COLUMN_NAME = 'StepID'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'approvalactions'
              AND COLUMN_NAME = 'StepID'
              AND REFERENCED_TABLE_NAME = 'approvalworkflowsteps'
        )
        THEN '⚠️ WARNING: FK constraint exists - will use Archive strategy instead of DELETE'
        ELSE '✅ INFO: No FK constraint - can safely DELETE old steps'
    END AS 'Check Result';

-- ============================================================
-- FINAL VERDICT
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'FINAL VERDICT' AS 'Test';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 
    CASE 
        WHEN @check_passed = 1
        THEN '✅✅✅ ALL CHECKS PASSED - SAFE TO PROCEED ✅✅✅'
        ELSE '❌❌❌ SOME CHECKS FAILED - DO NOT PROCEED ❌❌❌'
    END AS 'Final Result';

SELECT 
    CASE 
        WHEN @check_passed = 1
        THEN 'Next step: Run apply_qc_approval_workflow.sql'
        ELSE 'Fix the issues above before proceeding!'
    END AS 'Action Required';

-- ============================================================
-- Summary
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'SUMMARY' AS 'Section';
SELECT '═════════════════════════════════════════════' AS '';

SELECT 'Roles (PM, FM, GM)' AS 'Item',
       CASE WHEN (SELECT COUNT(*) FROM roles WHERE RoleCode IN ('PM', 'FM', 'GM')) = 3 
            THEN '✅' ELSE '❌' END AS 'Status';

SELECT 'QC_APPROVAL Workflow' AS 'Item',
       CASE WHEN EXISTS (SELECT 1 FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL') 
            THEN '✅' ELSE '❌' END AS 'Status';

SELECT 'Rejection Tracking Columns' AS 'Item',
       CASE WHEN (SELECT COUNT(*) FROM information_schema.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'quotationcomparisons'
                    AND COLUMN_NAME IN ('RejectionCount', 'LastRejectionDate', 'RejectionReason')) = 3
            THEN '✅' ELSE '❌' END AS 'Status';

-- ============================================================
-- ملاحظات نهائية:
--   1. إذا كانت النتيجة ✅ ALL CHECKS PASSED:
--      - يمكنك تشغيل apply_qc_approval_workflow.sql
--   2. إذا كانت النتيجة ❌ SOME CHECKS FAILED:
--      - راجع الأخطاء أعلاه وصححها قبل المتابعة
--   3. تأكد من عمل backup قبل تشغيل apply script
-- ============================================================
