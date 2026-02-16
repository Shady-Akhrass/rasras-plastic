-- ============================================================
-- Migration Script: Update Approval Workflows for Quality Controller
-- ============================================================
-- التاريخ: 2026-02-13
-- الإصدار: 1.3 (Final - All Foreign Key Issues Fixed)
-- 
-- الغرض:
--   ربط دور مراقب الجودة (QC) الموجود مسبقاً بسير اعتمادات GRN و Returns
--
-- ملاحظة مهمة:
--   ✓ دور QC موجود في قاعدة البيانات (RoleCode = 'QC')
--   ✓ هذا السكريبت آمن للتشغيل على localhost
--   ✓ تم إصلاح جميع مشاكل Foreign Key Constraints
--   ✓ ترتيب العمليات: NULL → DELETE actions → DELETE steps → INSERT new → UPDATE requests
--
-- التغييرات:
--   1. التحقق من دور QC والتأكد من صلاحياته
--   2. فك ارتباط جميع الطلبات (CurrentStepID = NULL)
--   3. حذف الإجراءات القديمة (approvalactions)
--   4. حذف وإعادة إنشاء خطوات workflows
--   5. تحديث GRN_APPROVAL: QC (خطوة 1) → PM (خطوة 2)
--   6. تحديث RET_APPROVAL: QC (خطوة 1)
--   7. إعادة ربط الطلبات المعلقة بالخطوات الجديدة
--
-- تحذير:
--   ⚠️ سيتم حذف approvalactions القديمة (سجل الإجراءات التاريخي)
--   ⚠️ الطلبات المعتمدة/المرفوضة ستبقى بدون خطوة (CurrentStepID = NULL)
--   ⚠️ الطلبات المعلقة ستُعاد للخطوة 1 الجديدة (QC)
--   ⚠️ يُنصح بعمل backup قبل التنفيذ (للأمان)
-- ============================================================

-- ============================================================
-- 0. فحص أولي - التحقق من المتطلبات
-- ============================================================

-- بداية Transaction
START TRANSACTION;

-- عرض حالة دور QC
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('✓ دور QC موجود (RoleID: ', MAX(RoleID), ')')
        ELSE '✗ تحذير: دور QC غير موجود!'
    END AS 'حالة دور مراقب الجودة'
FROM roles 
WHERE RoleCode = 'QC';

-- ============================================================
-- 1. التأكد من دور QC والصلاحيات
-- ============================================================

-- التأكد من وجود دور QC (موجود مسبقاً في قاعدة البيانات)
-- هذا الأمر للأمان فقط - لن يضيف دوراً جديداً إذا كان موجوداً
INSERT INTO roles (RoleCode, RoleNameAr, RoleNameEn, Description, IsActive, CreatedAt)
SELECT 'QC', 'مراقب الجودة', 'Quality Controller', 'فحص واعتماد الجودة', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE RoleCode = 'QC');

-- ============================================================
-- 2. التأكد من صلاحيات دور QC
-- ============================================================

-- إضافة الصلاحيات المطلوبة لدور QC إذا لم تكن موجودة
-- SECTION_MAIN: للوصول للصفحة الرئيسية وبريد الاعتمادات
-- SECTION_OPERATIONS: للوصول لإدارة الجودة وفحص الأصناف
INSERT INTO rolepermissions (RoleID, PermissionID, IsAllowed)
SELECT r.RoleID, p.PermissionID, 1
FROM roles r
CROSS JOIN permissions p
WHERE r.RoleCode = 'QC' 
  AND p.PermissionCode IN ('SECTION_MAIN', 'SECTION_OPERATIONS')
  AND NOT EXISTS (
    SELECT 1 FROM rolepermissions rp 
    WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID
  );

-- عرض الصلاحيات الحالية لدور QC
SELECT 
    r.RoleCode AS 'الدور',
    r.RoleNameAr AS 'الاسم',
    GROUP_CONCAT(p.PermissionCode SEPARATOR ', ') AS 'الصلاحيات'
FROM roles r
LEFT JOIN rolepermissions rp ON r.RoleID = rp.RoleID AND rp.IsAllowed = 1
LEFT JOIN permissions p ON rp.PermissionID = p.PermissionID
WHERE r.RoleCode = 'QC'
GROUP BY r.RoleID, r.RoleCode, r.RoleNameAr;

-- ============================================================
-- 3. تحديث GRN_APPROVAL Workflow Steps
-- ============================================================

-- الحصول على معرفات الـ workflows والأدوار
SET @grn_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'GRN_APPROVAL');
SET @qc_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'QC');
SET @pm_role_id = (SELECT RoleID FROM roles WHERE RoleCode = 'PM');

-- التحقق من وجود الأدوار المطلوبة
SELECT CASE 
    WHEN @qc_role_id IS NULL THEN 'خطأ: دور QC غير موجود!'
    WHEN @pm_role_id IS NULL THEN 'خطأ: دور PM غير موجود!'
    WHEN @grn_workflow_id IS NULL THEN 'خطأ: GRN workflow غير موجود!'
    ELSE 'تم العثور على جميع المتطلبات ✓'
END AS verification_status;

-- عرض عدد الطلبات المرتبطة بـ GRN قبل التحديث
SELECT 
    'طلبات GRN قبل التحديث' AS 'المرحلة',
    COUNT(*) AS 'العدد',
    GROUP_CONCAT(DISTINCT ar.Status SEPARATOR ', ') AS 'الحالات'
FROM approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
WHERE aw.WorkflowCode = 'GRN_APPROVAL';

-- تحديث جميع الطلبات المرتبطة بـ GRN (بغض النظر عن الحالة): جعل CurrentStepID = NULL مؤقتاً
UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
SET ar.CurrentStepID = NULL
WHERE aw.WorkflowCode = 'GRN_APPROVAL';

-- عرض عدد الطلبات المحدثة
SELECT ROW_COUNT() AS 'عدد طلبات GRN المحدثة';

-- حذف الإجراءات (actions) المرتبطة بخطوات GRN أولاً
DELETE aa FROM approvalactions aa
INNER JOIN approvalworkflowsteps aws ON aa.StepID = aws.StepID
WHERE aws.WorkflowID = @grn_workflow_id;

-- عرض عدد الإجراءات المحذوفة
SELECT ROW_COUNT() AS 'عدد إجراءات GRN المحذوفة';

-- حذف الخطوات القديمة لـ GRN workflow
DELETE FROM approvalworkflowsteps WHERE WorkflowID = @grn_workflow_id;

-- عرض عدد الخطوات المحذوفة
SELECT ROW_COUNT() AS 'عدد خطوات GRN المحذوفة';

-- إضافة الخطوة 1: اعتماد مراقب الجودة
INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverType, ApproverRoleID)
VALUES (@grn_workflow_id, 1, 'Quality Controller Approval', 'ROLE', @qc_role_id);

-- إضافة الخطوة 2: اعتماد مدير المشتريات
INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverType, ApproverRoleID)
VALUES (@grn_workflow_id, 2, 'Procurement Manager Approval', 'ROLE', @pm_role_id);

-- ============================================================
-- 4. تحديث RET_APPROVAL (Purchase Return) Workflow Steps
-- ============================================================

-- الحصول على معرف workflow
SET @ret_workflow_id = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'RET_APPROVAL');

-- تحديث جميع الطلبات المرتبطة بـ Return (بغض النظر عن الحالة): جعل CurrentStepID = NULL مؤقتاً
UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
SET ar.CurrentStepID = NULL
WHERE aw.WorkflowCode = 'RET_APPROVAL';

-- عرض عدد الطلبات المحدثة
SELECT ROW_COUNT() AS 'عدد طلبات Return المحدثة';

-- حذف الإجراءات (actions) المرتبطة بخطوات Return أولاً
DELETE aa FROM approvalactions aa
INNER JOIN approvalworkflowsteps aws ON aa.StepID = aws.StepID
WHERE aws.WorkflowID = @ret_workflow_id;

-- عرض عدد الإجراءات المحذوفة
SELECT ROW_COUNT() AS 'عدد إجراءات Return المحذوفة';

-- حذف الخطوات القديمة لـ Return workflow
DELETE FROM approvalworkflowsteps WHERE WorkflowID = @ret_workflow_id;

-- عرض عدد الخطوات المحذوفة
SELECT ROW_COUNT() AS 'عدد خطوات Return المحذوفة';

-- إضافة الخطوة 1: اعتماد مراقب الجودة (بدلاً من PM)
INSERT INTO approvalworkflowsteps (WorkflowID, StepNumber, StepName, ApproverType, ApproverRoleID)
VALUES (@ret_workflow_id, 1, 'Quality Controller Approval', 'ROLE', @qc_role_id);

-- ============================================================
-- 5. تحديث طلبات الاعتماد المعلقة (IMPORTANT)
-- ============================================================

-- تحديث طلبات GRN المعلقة لتبدأ من خطوة QC (الخطوة 1 الجديدة)
-- أي طلب GRN كان ينتظر PM سيعود لـ QC للاعتماد أولاً
UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
INNER JOIN approvalworkflowsteps aws ON aws.WorkflowID = aw.WorkflowID AND aws.StepNumber = 1
SET ar.CurrentStepID = aws.StepID
WHERE aw.WorkflowCode = 'GRN_APPROVAL' 
  AND ar.Status IN ('Pending', 'InProgress');

-- تحديث طلبات المرتجعات المعلقة لتستخدم خطوة QC
-- أي مرتجع كان ينتظر PM سيتم تحويله لـ QC
UPDATE approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
INNER JOIN approvalworkflowsteps aws ON aws.WorkflowID = aw.WorkflowID AND aws.StepNumber = 1
SET ar.CurrentStepID = aws.StepID
WHERE aw.WorkflowCode = 'RET_APPROVAL' 
  AND ar.Status IN ('Pending', 'InProgress');

-- ============================================================
-- 6. استعلام التحقق النهائي (شغّله للتأكد من التحديثات)
-- ============================================================

-- عرض تفاصيل workflows المحدثة
SELECT 
    aw.WorkflowCode AS 'كود سير العمل',
    aw.WorkflowName AS 'اسم سير العمل',
    aws.StepNumber AS 'رقم الخطوة',
    aws.StepName AS 'اسم الخطوة',
    r.RoleCode AS 'كود الدور',
    r.RoleNameAr AS 'اسم الدور بالعربي'
FROM approvalworkflows aw
INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aw.WorkflowCode IN ('GRN_APPROVAL', 'RET_APPROVAL')
ORDER BY aw.WorkflowCode, aws.StepNumber;

-- ============================================================
-- النتيجة المتوقعة:
-- ============================================================
-- | كود سير العمل | رقم الخطوة | اسم الخطوة                    | كود الدور | اسم الدور بالعربي |
-- |----------------|-------------|-------------------------------|-----------|-------------------|
-- | GRN_APPROVAL   | 1           | Quality Controller Approval   | QC        | مراقب الجودة      |
-- | GRN_APPROVAL   | 2           | Procurement Manager Approval  | PM        | مدير المشتريات    |
-- | RET_APPROVAL   | 1           | Quality Controller Approval   | QC        | مراقب الجودة      |
-- ============================================================

-- عرض عدد الطلبات المعلقة المحدثة
SELECT 
    'تم تحديث طلبات الاعتماد' AS 'الحالة',
    COUNT(CASE WHEN aw.WorkflowCode = 'GRN_APPROVAL' THEN 1 END) AS 'GRN المعلقة',
    COUNT(CASE WHEN aw.WorkflowCode = 'RET_APPROVAL' THEN 1 END) AS 'Returns المعلقة'
FROM approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
WHERE aw.WorkflowCode IN ('GRN_APPROVAL', 'RET_APPROVAL')
  AND ar.Status IN ('Pending', 'InProgress');

-- ============================================================
-- 7. عرض إحصائيات نهائية
-- ============================================================

-- عدد الخطوات الحالية لكل workflow
SELECT 
    'إحصائيات الخطوات' AS 'النوع',
    aw.WorkflowCode AS 'Workflow',
    COUNT(*) AS 'عدد الخطوات'
FROM approvalworkflows aw
INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
WHERE aw.WorkflowCode IN ('GRN_APPROVAL', 'RET_APPROVAL')
GROUP BY aw.WorkflowCode;

-- ============================================================
-- ✅ انتهى السكريبت بنجاح - تأكيد جميع التغييرات
-- ============================================================

-- تأكيد نهائي لجميع التغييرات
COMMIT;

-- ============================================================
-- ملاحظات ما بعد التنفيذ:
--   1. ✅ تم حذف approvalactions القديمة (سجل تاريخي)
--   2. ✅ تم تحديث خطوات workflows بنجاح
--   3. ✅ تم تحديث الطلبات المعلقة للخطوات الجديدة (QC)
--   4. 🔄 يُنصح بإعادة تشغيل الباكند (Ctrl+C ثم .\mvnw spring-boot:run)
--   5. 🎯 جرب النظام من /dashboard/approvals
-- ============================================================
