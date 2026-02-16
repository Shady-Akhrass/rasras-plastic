-- ============================================================
-- Migration Script: Add Rejection Tracking Columns
-- ============================================================
-- التاريخ: 2026-02-14
-- الهدف: إضافة حقول تتبع المراجعات في جدول quotationcomparisons
-- 
-- ⚠️ ملاحظة مهمة:
--   هذا السكريبت يجب تشغيله **قبل** apply_qc_approval_workflow.sql
--   لأن apply script يستخدم هذه الأعمدة في UPDATE
-- ============================================================

-- ⚠️ IMPORTANT: Select the correct database
-- تأكد من تشغيل هذا على قاعدة البيانات الصحيحة (erp_db أو اسم قاعدة بياناتك)
USE erp_db;

START TRANSACTION;

-- التحقق من وجود الجدول
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ جدول quotationcomparisons موجود'
        ELSE '❌ خطأ: جدول quotationcomparisons غير موجود!'
    END AS 'Table Check'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'quotationcomparisons';

-- إضافة الأعمدة الجديدة
-- ملاحظة: إذا كانت الأعمدة موجودة بالفعل، سيفشل الأمر (وهذا طبيعي)
ALTER TABLE quotationcomparisons 
ADD COLUMN RejectionCount INT DEFAULT 0 COMMENT 'عدد مرات الرفض',
ADD COLUMN LastRejectionDate DATETIME NULL COMMENT 'تاريخ آخر رفض',
ADD COLUMN RejectionReason TEXT NULL COMMENT 'سبب الرفض';

-- عرض النتيجة
SELECT 'Columns Added Successfully' AS 'Status';

-- تحديث القيم الافتراضية للسجلات الموجودة
UPDATE quotationcomparisons 
SET RejectionCount = 0 
WHERE RejectionCount IS NULL;

-- عرض بنية الجدول بعد التحديث
SHOW COLUMNS FROM quotationcomparisons WHERE Field IN ('RejectionCount', 'LastRejectionDate', 'RejectionReason');

-- ✅ إذا كل شيء تمام، نقفل الـ Transaction
COMMIT;

-- ============================================================
-- ملاحظات ما بعد التنفيذ:
--   1. ✅ تم إضافة 3 أعمدة جديدة
--   2. ✅ RejectionCount له قيمة افتراضية 0
--   3. ✅ LastRejectionDate و RejectionReason يسمحان بـ NULL
--   4. 🔄 الآن يمكن تشغيل apply_qc_approval_workflow.sql
-- ============================================================
