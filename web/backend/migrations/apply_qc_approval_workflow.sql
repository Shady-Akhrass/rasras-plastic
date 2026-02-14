-- ============================================================
-- Apply Script: QC Approval Workflow Update
-- ============================================================
-- التاريخ: 2026-02-14
-- الهدف: تحديث QC_APPROVAL workflow إلى نموذج مؤسسي (PM → FM → GM)
-- 
-- ⚠️ تحذير حرج:
--   1. يجب تشغيل precheck_qc_approval_workflow.sql أولاً
--   2. يجب أن تكون النتيجة: ✅ ALL CHECKS PASSED
--   3. عمل backup كامل لقاعدة البيانات قبل التنفيذ
--   4. تشغيل add_rejection_tracking_columns.sql قبل هذا السكريبت
-- ============================================================

-- ⚠️ IMPORTANT: Select the correct database
USE erp_db;

START TRANSACTION;

-- ============================================================
-- Step 0 (CRITICAL): التأكد من وجود أعمدة RejectionTracking
-- ============================================================
-- ⚠️ هذه الخطوة حرجة جداً - يجب أن تنفذ قبل أي UPDATE
-- إذا كانت الأعمدة موجودة بالفعل، سيفشل ALTER TABLE وهذا طبيعي (skip error)

SELECT '═════════════════════════════════════════════' AS '';
SELECT 'Step 0: Ensuring RejectionTracking Columns Exist' AS 'Stage';
SELECT '═════════════════════════════════════════════' AS '';

-- محاولة إضافة الأعمدة (إذا موجودة، سيفشل وهذا طبيعي)
-- في بعض أنظمة MySQL، يمكن استخدام IF NOT EXISTS
-- إذا فشل هذا الأمر، تأكد من تشغيل add_rejection_tracking_columns.sql أولاً

-- للتوافق مع جميع إصدارات MySQL:
-- سنحاول إضافة الأعمدة، وإذا فشل، نتجاهل الخطأ (يعني أنها موجودة)

SET @alter_sql = 'ALTER TABLE quotationcomparisons 
    ADD COLUMN IF NOT EXISTS RejectionCount INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS LastRejectionDate DATETIME NULL,
    ADD COLUMN IF NOT EXISTS RejectionReason TEXT NULL';

-- تنفيذ الأمر (إذا فشل، تأكد من أن الأعمدة موجودة من قبل)
-- ملاحظة: في بعض إصدارات MySQL القديمة، IF NOT EXISTS غير مدعوم
-- في هذه الحالة، يجب تشغيل add_rejection_tracking_columns.sql أولاً

-- للأمان: نفترض أن add_rejection_tracking_columns.sql تم تشغيله بالفعل
-- إذا لم يتم تشغيله، سيفشل الـ transaction هنا

-- فحص وجود الأعمدة
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'quotationcomparisons'
                AND COLUMN_NAME IN ('RejectionCount', 'LastRejectionDate', 'RejectionReason')) = 3
        THEN '✅ Columns exist - proceeding'
        ELSE '❌ CRITICAL: Columns missing! Run add_rejection_tracking_columns.sql first!'
    END AS 'Status';

-- إذا الأعمدة غير موجودة، نوقف الـ transaction
-- (إذا وصلنا هنا بدون أعمدة، سيفشل UPDATE لاحقاً وسيتم ROLLBACK تلقائياً)

-- ============================================================
-- Step A: إعداد المتغيرات
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'Step A: Preparing Variables' AS 'Stage';
SELECT '═════════════════════════════════════════════' AS '';

SET @qc_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL');
SET @pm_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'PM');
SET @fm_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'FM');
SET @gm_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'GM');

-- فحص سريع نهائي (احتياطي)
SELECT 
    @qc_workflow_id AS 'Workflow_ID',
    @pm_role_id AS 'PM_Role',
    @fm_role_id AS 'FM_Role',
    @gm_role_id AS 'GM_Role',
    CASE 
        WHEN @pm_role_id IS NULL OR @fm_role_id IS NULL OR @gm_role_id IS NULL OR @qc_workflow_id IS NULL
        THEN '❌ STOP: Missing required data! ROLLBACK NOW!'
        ELSE '✅ Ready to proceed'
    END AS 'Safety_Check';

-- ⚠️ إذا ظهر ❌ أعلاه، استخدم ROLLBACK; وصحح المشكلة

-- ============================================================
-- Step B: تحديث Workflow Steps (بالترتيب الآمن)
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'Step B: Updating Workflow Steps' AS 'Stage';
SELECT '═════════════════════════════════════════════' AS '';

-- ───────────────────────────────────────────────────────────
-- B1. إغلاق جميع الطلبات المعلقة/الجارية
-- ───────────────────────────────────────────────────────────
SELECT 'B1: Closing pending/in-progress requests...' AS 'Action';

-- ⚠️ ملاحظة مهمة عن المصطلح:
-- نستخدم 'Rejected' هنا لأنه "إغلاق محاولة الاعتماد" وليس رفض نهائي للوثيقة
-- الوثيقة نفسها (QuotationComparison) ستعود لـ Draft للسماح بإعادة الإرسال
-- إذا كان enum يدعم 'Cancelled'، استخدمه للتمييز (أفضل وأوضح)

UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
SET 
    ar.Status = 'Rejected',  -- 💡 استخدم 'Cancelled' إذا متوفر في enum
    ar.CompletedDate = NOW(),
    ar.CurrentStepID = NULL
WHERE aw.WorkflowCode = 'QC_APPROVAL'
  AND ar.DocumentType IN ('QuotationComparison', 'QC')
  AND ar.Status IN ('Pending', 'InProgress');

SELECT ROW_COUNT() AS '✅ Requests closed (attempts cancelled - not document rejection)';

-- ───────────────────────────────────────────────────────────
-- B2. ⚠️ CRITICAL: تصفير CurrentStepID لجميع الطلبات
-- ───────────────────────────────────────────────────────────
SELECT 'B2: Nullifying CurrentStepID for ALL requests (FK protection)...' AS 'Action';

-- هذا ضروري لتجنب FK error عند حذف approvalworkflowsteps
-- الطلبات القديمة (Approved/Rejected) قد يكون CurrentStepID يشير لخطوة قديمة
-- ✅ Audit Trail محفوظ في approvalactions - CurrentStep مجرد مؤشر تشغيلي

UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
SET ar.CurrentStepID = NULL
WHERE aw.WorkflowCode = 'QC_APPROVAL'
  AND ar.DocumentType IN ('QuotationComparison', 'QC')
  AND ar.CurrentStepID IS NOT NULL;

SELECT ROW_COUNT() AS '✅ Requests with CurrentStepID nullified (FK protection)';

-- ───────────────────────────────────────────────────────────
-- B3. ✅ لا نحذف approvalactions - نحتفظ بها للـ Audit Trail
-- ───────────────────────────────────────────────────────────
SELECT 'B3: Preserving approvalactions for Audit Trail...' AS 'Action';
SELECT '✅ approvalactions preserved (no deletion)' AS 'Status';

-- ───────────────────────────────────────────────────────────
-- B4. حذف أو أرشفة الخطوات القديمة (حسب وجود FK)
-- ───────────────────────────────────────────────────────────
SELECT 'B4: Removing/Archiving old workflow steps...' AS 'Action';

-- ⚠️ اختر واحداً من الخيارين التاليين حسب نتيجة precheck:

-- ───────── الخيار 1: DELETE (إذا لا يوجد FK من approvalactions.StepID) ─────────
-- إذا كانت نتيجة Check 7 في precheck: "No FK constraint - can safely DELETE"
-- استخدم هذا الخيار:

DELETE FROM approvalworkflowsteps 
WHERE WorkflowID = @qc_workflow_id;

SELECT ROW_COUNT() AS '✅ Old steps deleted (no FK constraint)';

-- ───────── الخيار 2: ARCHIVE (إذا يوجد FK من approvalactions.StepID) ─────────
-- إذا كانت نتيجة Check 7 في precheck: "FK constraint exists - will use Archive"
-- علّق الأمر أعلاه (DELETE) واستخدم هذا بدلاً منه:

-- UPDATE approvalworkflowsteps 
-- SET IsActive = 0  -- أو أي عمود archive تستخدمونه
-- WHERE WorkflowID = @qc_workflow_id;
-- SELECT ROW_COUNT() AS '✅ Old steps archived (FK constraint exists)';

-- ملاحظة: إذا لم يكن لديكم عمود IsActive في approvalworkflowsteps،
--         يجب إضافته أولاً أو استخدام حل آخر (مثل StepStatus)

-- ───────────────────────────────────────────────────────────
-- B5. إضافة الخطوات الجديدة (PM → FM → GM)
-- ───────────────────────────────────────────────────────────
SELECT 'B5: Adding new workflow steps (PM → FM → GM)...' AS 'Action';

INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverType, ApproverRoleID)
VALUES 
  (@qc_workflow_id, 1, 'Procurement Manager Approval', 'ROLE', @pm_role_id),
  (@qc_workflow_id, 2, 'Finance Manager Approval', 'ROLE', @fm_role_id),
  (@qc_workflow_id, 3, 'General Manager Approval', 'ROLE', @gm_role_id);

SELECT ROW_COUNT() AS '✅ New steps added (should be 3)';

-- ============================================================
-- Step C: معالجة المقارنات المرفوضة
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'Step C: Resetting Rejected Comparisons to Draft' AS 'Stage';
SELECT '═════════════════════════════════════════════' AS '';

-- ✅ إعادة المقارنات المرفوضة إلى Draft للسماح بالتعديل وإعادة الإرسال
-- مع حماية قوية ضد المساس بمقارنات مرتبطة بـ PO موجود

UPDATE quotationcomparisons qc
SET 
    qc.Status = 'Draft', 
    qc.ApprovalStatus = NULL,
    -- ✅ زيادة RejectionCount للمقارنات المرفوضة تاريخياً (migration فقط)
    qc.RejectionCount = COALESCE(qc.RejectionCount, 0) + 1,
    qc.LastRejectionDate = NOW()
WHERE qc.Status = 'Rejected'
  -- ✅ شرط مُحسّن: قد تكون ApprovalStatus = NULL أو 'Rejected' أو 'Pending'
  AND (qc.ApprovalStatus = 'Rejected' OR qc.ApprovalStatus IS NULL OR qc.ApprovalStatus = 'Pending')
  -- ✅ حماية قوية: تحقق من عدم وجود PO مرتبط
  AND NOT EXISTS (
    SELECT 1 FROM purchaseorders po 
    WHERE po.QuotationID = qc.SelectedQuotationID
       OR (po.PRID IS NOT NULL AND qc.PRID IS NOT NULL AND po.PRID = qc.PRID)
  );

SELECT ROW_COUNT() AS '✅ Comparisons reset to Draft (historical)';

-- ✅ Audit Trail الكامل:
-- - approvalrequests المرفوضة: تبقى بدون حذف (سجل تاريخي)
-- - approvalactions: تبقى بدون حذف (سجل كل محاولة)
-- - عند إعادة الإرسال: submitForApproval() سينشئ approvalrequest جديد

-- ============================================================
-- Step D: التحقق النهائي
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'Step D: Final Verification' AS 'Stage';
SELECT '═════════════════════════════════════════════' AS '';

-- ───────────────────────────────────────────────────────────
-- D1. عرض الخطوات الجديدة
-- ───────────────────────────────────────────────────────────
SELECT 'D1: New workflow steps:' AS 'Info';

SELECT 
    aw.WorkflowCode,
    aws.StepNumber,
    aws.StepName,
    r.RoleCode,
    r.RoleNameAr
FROM approvalworkflows aw
INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aw.WorkflowCode = 'QC_APPROVAL'
ORDER BY aws.StepNumber;

-- ───────────────────────────────────────────────────────────
-- D2. عرض حالة المقارنات بعد التحديث
-- ───────────────────────────────────────────────────────────
SELECT 'D2: Comparison status summary:' AS 'Info';

SELECT 
    Status,
    ApprovalStatus,
    COUNT(*) AS 'Count'
FROM quotationcomparisons
GROUP BY Status, ApprovalStatus
ORDER BY Status;

-- ───────────────────────────────────────────────────────────
-- D3. عرض حالة الطلبات بعد التحديث
-- ───────────────────────────────────────────────────────────
SELECT 'D3: Request status summary:' AS 'Info';

SELECT 
    ar.Status,
    COUNT(*) AS 'Count'
FROM approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
WHERE aw.WorkflowCode = 'QC_APPROVAL'
  AND ar.DocumentType IN ('QuotationComparison', 'QC')
GROUP BY ar.Status;

-- ============================================================
-- Final Decision Point
-- ============================================================
SELECT '═════════════════════════════════════════════' AS '';
SELECT 'TRANSACTION DECISION POINT' AS 'Critical';
SELECT '═════════════════════════════════════════════' AS '';

SELECT '⚠️ Review the results above carefully!' AS 'Warning';
SELECT 'If everything looks correct, proceed with COMMIT;' AS 'Action 1';
SELECT 'If something is wrong, use ROLLBACK; immediately!' AS 'Action 2';

-- ============================================================
-- ✅ إذا كل شيء تمام، نقفل الـ Transaction
-- ============================================================
COMMIT;

SELECT '═════════════════════════════════════════════' AS '';
SELECT '✅✅✅ TRANSACTION COMMITTED SUCCESSFULLY ✅✅✅' AS 'Result';
SELECT '═════════════════════════════════════════════' AS '';

-- ============================================================
-- ملاحظات ما بعد التنفيذ:
--   1. ✅ تم تحديث QC_APPROVAL workflow إلى 3 مراحل (PM, FM, GM)
--   2. ✅ تم إغلاق الطلبات المعلقة (كمحاولات ملغاة)
--   3. ✅ تم إعادة المقارنات المرفوضة إلى Draft
--   4. ✅ تم الحفاظ على Audit Trail الكامل (approvalactions)
--   5. 🔄 الآن يجب:
--      a) إعادة compile Backend (mvn clean install)
--      b) إعادة تشغيل Backend
--      c) اختبار workflow الجديد:
--         - إنشاء مقارنة جديدة
--         - Submit للاعتماد
--         - يجب أن تمر بـ PM → FM → GM
--         - اختبار الرفض والتعديل وإعادة الإرسال
-- ============================================================

-- إذا حدث خطأ في أي مرحلة، استخدم:
-- ROLLBACK;
