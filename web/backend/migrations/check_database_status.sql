-- ============================================================
-- سكريبت فحص حالة قاعدة البيانات
-- ============================================================
-- الغرض: عرض إحصائيات سريعة لجميع جداول قاعدة البيانات
-- الاستخدام: شغّل هذا السكريبت قبل وبعد التنظيف للمقارنة
-- ============================================================

SELECT '🔍 إحصائيات قاعدة البيانات - rasras_plastic' AS 'التقرير';
SELECT '=================================================' AS '';

-- ============================================================
-- 1. الموظفين والصلاحيات (يجب أن تبقى)
-- ============================================================
SELECT '👥 الموظفين والصلاحيات' AS 'القسم';
SELECT '------------------------' AS '';

SELECT 
    'الموظفين (Users)' AS 'الجدول',
    COUNT(*) AS 'العدد',
    '✅ يجب أن يبقى' AS 'الحالة'
FROM users
UNION ALL
SELECT 'الأدوار (Roles)', COUNT(*), '✅ يجب أن يبقى' FROM roles
UNION ALL
SELECT 'الصلاحيات (Permissions)', COUNT(*), '✅ يجب أن يبقى' FROM permissions
UNION ALL
SELECT 'صلاحيات الأدوار (RolePermissions)', COUNT(*), '✅ يجب أن يبقى' FROM rolepermissions;

SELECT '' AS '';

-- ============================================================
-- 2. الإعدادات الأساسية (يجب أن تبقى)
-- ============================================================
SELECT '⚙️ الإعدادات الأساسية' AS 'القسم';
SELECT '------------------------' AS '';

SELECT 
    'المخازن (Warehouses)' AS 'الجدول',
    COUNT(*) AS 'العدد',
    '✅ يجب أن يبقى' AS 'الحالة'
FROM warehouses
UNION ALL
SELECT 'الوحدات (Units)', COUNT(*), '✅ يجب أن يبقى' FROM units
UNION ALL
SELECT 'سير العمل (ApprovalWorkflows)', COUNT(*), '✅ يجب أن يبقى' FROM approvalworkflows
UNION ALL
SELECT 'خطوات سير العمل (WorkflowSteps)', COUNT(*), '✅ يجب أن يبقى' FROM approvalworkflowsteps
UNION ALL
SELECT 'حدود الاعتماد (ApprovalLimits)', COUNT(*), '✅ يجب أن يبقى' FROM approvallimits
UNION ALL
SELECT 'معايير الجودة (QualityParameters)', COUNT(*), '✅ يجب أن يبقى' FROM qualityparameters;

SELECT '' AS '';

-- ============================================================
-- 3. المخزون (سيتم حذفها)
-- ============================================================
SELECT '📦 المخزون' AS 'القسم';
SELECT '------------------------' AS '';

SELECT 
    'فئات الأصناف (ItemCategories)' AS 'الجدول',
    COUNT(*) AS 'العدد',
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END AS 'الحالة'
FROM itemcategories
UNION ALL
SELECT 
    'الأصناف (Items)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM items
UNION ALL
SELECT 
    'أرصدة المخزون (ItemStocks)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM itemstocks
UNION ALL
SELECT 
    'حركات المخزون (InventoryTransactions)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM inventorytransactions;

SELECT '' AS '';

-- ============================================================
-- 4. الموردين والمشتريات (سيتم حذفها)
-- ============================================================
SELECT '🛒 الموردين والمشتريات' AS 'القسم';
SELECT '------------------------' AS '';

SELECT 
    'الموردين (Suppliers)' AS 'الجدول',
    COUNT(*) AS 'العدد',
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END AS 'الحالة'
FROM suppliers
UNION ALL
SELECT 
    'طلبات الشراء (PurchaseRequisitions)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM purchaserequisitions
UNION ALL
SELECT 
    'طلبات الأسعار RFQ (RequestsForQuotation)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM requestsforquotation
UNION ALL
SELECT 
    'عروض أسعار الموردين (SupplierQuotations)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM supplierquotations
UNION ALL
SELECT 
    'مقارنات العروض (QuotationComparisons)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM quotationcomparisons
UNION ALL
SELECT 
    'أوامر الشراء (PurchaseOrders)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM purchaseorders
UNION ALL
SELECT 
    'إذونات الإضافة GRN (GoodsReceiptNotes)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM goodsreceiptnotes
UNION ALL
SELECT 
    'مرتجعات المشتريات (PurchaseReturns)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM purchasereturns;

SELECT '' AS '';

-- ============================================================
-- 5. المالية (سيتم حذفها)
-- ============================================================
SELECT '💰 المالية' AS 'القسم';
SELECT '------------------------' AS '';

SELECT 
    'فواتير الموردين (SupplierInvoices)' AS 'الجدول',
    COUNT(*) AS 'العدد',
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END AS 'الحالة'
FROM supplierinvoices
UNION ALL
SELECT 
    'سندات الصرف (PaymentVouchers)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM paymentvouchers;

SELECT '' AS '';

-- ============================================================
-- 6. العملاء والمبيعات (سيتم حذفها)
-- ============================================================
SELECT '💼 العملاء والمبيعات' AS 'القسم';
SELECT '------------------------' AS '';

SELECT 
    'العملاء (Customers)' AS 'الجدول',
    COUNT(*) AS 'العدد',
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END AS 'الحالة'
FROM customers
UNION ALL
SELECT 
    'عروض أسعار المبيعات (SalesQuotations)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM salesquotations
UNION ALL
SELECT 
    'فواتير المبيعات (SalesInvoices)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM salesinvoices;

SELECT '' AS '';

-- ============================================================
-- 7. الجودة والاعتمادات (سيتم حذفها)
-- ============================================================
SELECT '✅ الجودة والاعتمادات' AS 'القسم';
SELECT '------------------------' AS '';

SELECT 
    'فحوصات الجودة (QualityInspections)' AS 'الجدول',
    COUNT(*) AS 'العدد',
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END AS 'الحالة'
FROM qualityinspections
UNION ALL
SELECT 
    'طلبات الاعتماد (ApprovalRequests)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM approvalrequests
UNION ALL
SELECT 
    'إجراءات الاعتماد (ApprovalActions)', 
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ نظيف' ELSE '⚠️ يحتوي على بيانات' END
FROM approvalactions;

SELECT '' AS '';

-- ============================================================
-- 8. ملخص النتائج
-- ============================================================
SELECT '📊 ملخص النتائج' AS 'القسم';
SELECT '=================================================' AS '';

SELECT 
    CONCAT('✅ إجمالي الموظفين: ', COUNT(*)) AS 'النتيجة'
FROM users
UNION ALL
SELECT CONCAT('⚙️ إجمالي المخازن: ', COUNT(*)) FROM warehouses
UNION ALL
SELECT CONCAT('📦 إجمالي الأصناف: ', COUNT(*)) FROM items
UNION ALL
SELECT CONCAT('🛒 إجمالي الموردين: ', COUNT(*)) FROM suppliers
UNION ALL
SELECT CONCAT('💼 إجمالي العملاء: ', COUNT(*)) FROM customers
UNION ALL
SELECT CONCAT('📝 إجمالي أوامر الشراء: ', COUNT(*)) FROM purchaseorders
UNION ALL
SELECT CONCAT('📥 إجمالي إذونات الإضافة: ', COUNT(*)) FROM goodsreceiptnotes
UNION ALL
SELECT CONCAT('💰 إجمالي فواتير الموردين: ', COUNT(*)) FROM supplierinvoices
UNION ALL
SELECT CONCAT('🔄 إجمالي حركات المخزون: ', COUNT(*)) FROM inventorytransactions
UNION ALL
SELECT CONCAT('✅ إجمالي طلبات الاعتماد: ', COUNT(*)) FROM approvalrequests;

-- ============================================================
-- ملاحظة: 
-- شغّل هذا السكريبت قبل التنظيف لمعرفة حجم البيانات
-- ثم شغّله بعد التنظيف للتأكد من نجاح العملية
-- ============================================================
