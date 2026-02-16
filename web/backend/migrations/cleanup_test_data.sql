-- ============================================================
-- سكريبت تنظيف البيانات التجريبية
-- ============================================================
-- التاريخ: 2026-02-13 (محدّث)
-- الغرض: حذف جميع البيانات التجريبية مع الاحتفاظ بالموظفين والإعدادات
--
-- ⚠️ تحذير: هذا السكريبت سيحذف جميع البيانات التشغيلية!
-- 
-- ✅ سيتم الاحتفاظ بـ:
--    - بيانات الموظفين (Users, Roles, Permissions)
--    - إعدادات النظام (Workflows, Parameters, Units)
--    - المخازن (Warehouses)
--
-- 🔧 ملاحظة: يتم تعطيل Foreign Key Checks مؤقتاً لتسهيل عملية الحذف
--             ويُعاد تفعيلها في نهاية السكريبت
-- ============================================================

-- بداية Transaction
START TRANSACTION;

-- ⚠️ تعطيل فحص Foreign Keys مؤقتاً لتسهيل الحذف
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. حذف بيانات المبيعات والعملاء
-- ============================================================

-- حذف تفاصيل فواتير المبيعات
DELETE FROM salesinvoiceitems;

-- حذف فواتير المبيعات
DELETE FROM salesinvoices;

-- حذف أوامر المبيعات
DELETE FROM salesorderitems;
DELETE FROM salesorders;

-- حذف مرتجعات المبيعات
DELETE FROM salesreturnitems;
DELETE FROM salesreturns;

-- حذف تفاصيل عروض الأسعار (Sales Quotations)
DELETE FROM salesquotationitems;

-- حذف عروض الأسعار (Sales Quotations)
DELETE FROM salesquotations;

-- حذف أوامر التسليم
DELETE FROM deliveryorders;

-- حذف إشعارات الدائن والمدين
DELETE FROM creditnotes;
DELETE FROM debitnotes;

-- حذف جهات اتصال العملاء
DELETE FROM customercontacts;

-- حذف العملاء
DELETE FROM customers;

-- ============================================================
-- 2. حذف بيانات المشتريات (من الأصغر للأكبر)
-- ============================================================

-- حذف إجراءات الاعتماد (يعتمد على طلبات الاعتماد)
DELETE FROM approvalactions;

-- حذف طلبات الاعتماد (قبل حذف الوثائق المرتبطة)
DELETE FROM approvalrequests;

-- حذف مرتجعات المشتريات (التفاصيل أولاً)
DELETE FROM purchasereturnitems;
DELETE FROM purchasereturns;

-- حذف حركات وأرصدة المخزون
DELETE FROM stockmovements;
DELETE FROM stockbalances;
DELETE FROM stockadjustmentitems;
DELETE FROM stockadjustments;
DELETE FROM stocktransferitems;
DELETE FROM stocktransfers;
DELETE FROM stockissuenoteitems;
DELETE FROM stockissuenotes;
DELETE FROM stockreservations;

-- حذف فواتير الموردين والمدفوعات (المدفوعات أولاً)
DELETE FROM paymentvoucherallocations;
DELETE FROM paymentvouchers;
DELETE FROM receiptvoucherallocations;
DELETE FROM receiptvouchers;
DELETE FROM supplierinvoiceitems;
DELETE FROM supplierinvoices;

-- حذف الشيكات
DELETE FROM chequesissued;
DELETE FROM chequesreceived;

-- حذف المعاملات البنكية
DELETE FROM banktransactions;

-- حذف القيود اليومية
DELETE FROM journalentrylines;
DELETE FROM journalentries;

-- حذف إذونات الإضافة GRN (التفاصيل والفحوصات أولاً)
DELETE FROM qualityinspectionresults;
DELETE FROM qualityinspections;
DELETE FROM grnitems;
DELETE FROM goodsreceiptnotes;

-- حذف أوامر الشراء (التفاصيل أولاً)
DELETE FROM purchaseorderitems;
DELETE FROM purchaseorders;

-- حذف مقارنات العروض (التفاصيل أولاً)
DELETE FROM quotationcomparisondetails;
DELETE FROM quotationcomparisons;

-- حذف عروض أسعار الموردين (التفاصيل أولاً)
DELETE FROM supplierquotationitems;
DELETE FROM supplierquotations;

-- حذف طلبات الأسعار RFQ (التفاصيل أولاً)
DELETE FROM rfqitems;
DELETE FROM requestforquotations;

-- حذف طلبات الشراء (التفاصيل أولاً)
DELETE FROM purchaserequisitionitems;
DELETE FROM purchaserequisitions;

-- حذف بيانات الموردين المرتبطة
DELETE FROM supplieritems;
DELETE FROM supplier_items;
DELETE FROM supplier_banks;

-- حذف الموردين (في النهاية بعد حذف كل ما يرتبط بهم)
DELETE FROM suppliers;

-- ============================================================
-- 3. حذف بيانات المخزون (من الأصغر للأكبر، المخازن تبقى)
-- ============================================================

-- حذف بيانات المخزون المتقدمة
DELETE FROM inventorybatches;
DELETE FROM itemqualityspecs;

-- حذف قوائم الأسعار
DELETE FROM pricelistitems;
DELETE FROM pricelists;

-- حذف الأصناف (يعتمد على فئات الأصناف)
DELETE FROM items;

-- حذف فئات الأصناف (في النهاية)
DELETE FROM itemcategories;

-- ============================================================
-- 4. حذف بيانات أخرى
-- ============================================================

-- حذف الإشعارات وسجلات التتبع
DELETE FROM notifications;
DELETE FROM auditlog;
DELETE FROM documentcycletracking;
DELETE FROM documentrelationships;

-- حذف أسعار السوق اليومية
DELETE FROM dailymarketprices;
DELETE FROM suggestedsellingprices;

-- حذف بيانات الموارد البشرية (الرواتب والحضور فقط، الموظفين يبقون)
DELETE FROM payrolldetails;
DELETE FROM payroll;
DELETE FROM attendance;
DELETE FROM leaverequests;

-- ============================================================
-- 5. إعادة تعيين الـ Auto Increment للجداول
-- ============================================================

-- المبيعات
ALTER TABLE salesinvoices AUTO_INCREMENT = 1;
ALTER TABLE salesorders AUTO_INCREMENT = 1;
ALTER TABLE salesreturns AUTO_INCREMENT = 1;
ALTER TABLE salesquotations AUTO_INCREMENT = 1;
ALTER TABLE deliveryorders AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;

-- المشتريات
ALTER TABLE purchaserequisitions AUTO_INCREMENT = 1;
ALTER TABLE requestforquotations AUTO_INCREMENT = 1;
ALTER TABLE supplierquotations AUTO_INCREMENT = 1;
ALTER TABLE quotationcomparisons AUTO_INCREMENT = 1;
ALTER TABLE purchaseorders AUTO_INCREMENT = 1;
ALTER TABLE goodsreceiptnotes AUTO_INCREMENT = 1;
ALTER TABLE purchasereturns AUTO_INCREMENT = 1;
ALTER TABLE suppliers AUTO_INCREMENT = 1;

-- المخزون
ALTER TABLE items AUTO_INCREMENT = 1;
ALTER TABLE itemcategories AUTO_INCREMENT = 1;
ALTER TABLE stockbalances AUTO_INCREMENT = 1;
ALTER TABLE stockmovements AUTO_INCREMENT = 1;
ALTER TABLE stockadjustments AUTO_INCREMENT = 1;
ALTER TABLE stocktransfers AUTO_INCREMENT = 1;
ALTER TABLE stockissuenotes AUTO_INCREMENT = 1;
ALTER TABLE inventorybatches AUTO_INCREMENT = 1;

-- المالية
ALTER TABLE supplierinvoices AUTO_INCREMENT = 1;
ALTER TABLE paymentvouchers AUTO_INCREMENT = 1;
ALTER TABLE receiptvouchers AUTO_INCREMENT = 1;
ALTER TABLE journalentries AUTO_INCREMENT = 1;
ALTER TABLE chequesissued AUTO_INCREMENT = 1;
ALTER TABLE chequesreceived AUTO_INCREMENT = 1;
ALTER TABLE creditnotes AUTO_INCREMENT = 1;
ALTER TABLE debitnotes AUTO_INCREMENT = 1;

-- فحص الجودة
ALTER TABLE qualityinspections AUTO_INCREMENT = 1;

-- الاعتمادات
ALTER TABLE approvalrequests AUTO_INCREMENT = 1;
ALTER TABLE approvalactions AUTO_INCREMENT = 1;

-- الموارد البشرية
ALTER TABLE payroll AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE leaverequests AUTO_INCREMENT = 1;

-- ============================================================
-- 6. عرض إحصائيات التنظيف
-- ============================================================

SELECT '✅ تم حذف جميع البيانات التجريبية بنجاح!' AS 'النتيجة';

SELECT 
    'الموظفين' AS 'الجدول',
    COUNT(*) AS 'عدد السجلات المتبقية'
FROM users
UNION ALL
SELECT 'المخازن', COUNT(*) FROM warehouses
UNION ALL
SELECT 'الوحدات', COUNT(*) FROM units
UNION ALL
SELECT 'الأدوار', COUNT(*) FROM roles
UNION ALL
SELECT 'سير العمل', COUNT(*) FROM approvalworkflows
UNION ALL
SELECT 'معايير الجودة', COUNT(*) FROM qualityparameters;

-- ============================================================
-- 7. التحقق من نظافة الجداول
-- ============================================================

SELECT 
    '--- التحقق من نظافة جداول العمليات ---' AS 'التحقق';

SELECT 
    'العملاء' AS 'الجدول',
    COUNT(*) AS 'عدد السجلات (يجب أن يكون 0)'
FROM customers
UNION ALL
SELECT 'الموردين', COUNT(*) FROM suppliers
UNION ALL
SELECT 'الأصناف', COUNT(*) FROM items
UNION ALL
SELECT 'طلبات الشراء', COUNT(*) FROM purchaserequisitions
UNION ALL
SELECT 'طلبات الأسعار (RFQ)', COUNT(*) FROM requestforquotations
UNION ALL
SELECT 'عروض أسعار الموردين', COUNT(*) FROM supplierquotations
UNION ALL
SELECT 'أوامر الشراء', COUNT(*) FROM purchaseorders
UNION ALL
SELECT 'إذونات الإضافة (GRN)', COUNT(*) FROM goodsreceiptnotes
UNION ALL
SELECT 'فواتير الموردين', COUNT(*) FROM supplierinvoices
UNION ALL
SELECT 'سندات الصرف', COUNT(*) FROM paymentvouchers
UNION ALL
SELECT 'فواتير المبيعات', COUNT(*) FROM salesinvoices
UNION ALL
SELECT 'أوامر المبيعات', COUNT(*) FROM salesorders
UNION ALL
SELECT 'أرصدة المخزون', COUNT(*) FROM stockbalances
UNION ALL
SELECT 'حركات المخزون', COUNT(*) FROM stockmovements
UNION ALL
SELECT 'تحويلات المخزون', COUNT(*) FROM stocktransfers
UNION ALL
SELECT 'طلبات الاعتماد', COUNT(*) FROM approvalrequests;

-- ============================================================
-- ✅ إعادة تفعيل فحص Foreign Keys
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ✅ تأكيد التغييرات
-- ============================================================

COMMIT;

-- ============================================================
-- ملاحظات ما بعد التنفيذ:
-- ============================================================
-- 1. ✅ تم حذف جميع البيانات التجريبية
-- 2. ✅ تم الاحتفاظ ببيانات الموظفين والأدوار
-- 3. ✅ تم الاحتفاظ بالمخازن والوحدات
-- 4. ✅ تم الاحتفاظ بسير العمل ومعايير الجودة
-- 5. ✅ تم إعادة تعيين Auto Increment للجداول
-- 
-- 🔄 يمكنك الآن البدء بإدخال البيانات الحقيقية!
-- ============================================================
