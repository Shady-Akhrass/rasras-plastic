-- ============================================================
-- تنظيف قاعدة البيانات - حذف كل البيانات ما عدا المستخدمين والموظفين والصلاحيات
-- Clean Database - Delete all data EXCEPT users, employees, permissions
-- قاعدة البيانات: rasrasplastics
-- ============================================================

USE rasrasplastics;

SET FOREIGN_KEY_CHECKS = 0;

-- ========== طلبات الموافقة ==========
DELETE FROM approvalactions;
DELETE FROM approvalrequests;

-- ========== السجلات والتنبيهات ==========
DELETE FROM auditlog;
DELETE FROM notifications;

-- ========== البنوك والمالية ==========
DELETE FROM banktransactions;
DELETE FROM chequesissued;
DELETE FROM chequesreceived;
DELETE FROM paymentvoucherallocations;
DELETE FROM paymentvouchers;
DELETE FROM receiptvoucherallocations;
DELETE FROM receiptvouchers;
DELETE FROM bankaccounts;
DELETE FROM banks;

-- ========== الشيكات والصندوق ==========
DELETE FROM cashregisters;

-- ========== المحاسبة ==========
DELETE FROM journalentrylines;
DELETE FROM journalentries;
DELETE FROM debitnotes;
DELETE FROM creditnotes;
DELETE FROM chartofaccounts;

-- ========== مراكز التكلفة ==========
DELETE FROM costcenters;

-- ========== العملاء ==========
DELETE FROM customercontacts;
DELETE FROM customers;

-- ========== أسعار السوق ==========
DELETE FROM dailymarketprices;

-- ========== التوصيل ==========
DELETE FROM deliveryorders;
DELETE FROM deliveryzones;
DELETE FROM transportcontractors;
DELETE FROM vehicles;

-- ========== تتبع المستندات ==========
DELETE FROM documentcycletracking;
DELETE FROM documentrelationships;
DELETE FROM documentsequences;

-- ========== الفترات المالية ==========
DELETE FROM fiscalperiods;
DELETE FROM fiscalyears;
DELETE FROM exchangerates;

-- ========== الاستلام والمخازن ==========
DELETE FROM grnitems;
DELETE FROM goodsreceiptnotes;
DELETE FROM inventorybatches;
DELETE FROM stockmovements;
DELETE FROM stockreservations;
DELETE FROM stockbalances;
DELETE FROM stockadjustmentitems;
DELETE FROM stockadjustments;
DELETE FROM stockissuenoteitems;
DELETE FROM stockissuenotes;
DELETE FROM stocktransferitems;
DELETE FROM stocktransfers;
DELETE FROM warehouselocations;
DELETE FROM warehouses;

-- ========== البنود والمنتجات ==========
DELETE FROM itemqualityspecs;
DELETE FROM suggestedsellingprices;
DELETE FROM pricelistitems;
DELETE FROM pricelists;
DELETE FROM items;
DELETE FROM itemcategories;

-- ========== الرواتب ==========
DELETE FROM payrolldetails;
DELETE FROM payroll;

-- ========== المشتريات ==========
DELETE FROM purchaserequisitionitems;
DELETE FROM purchaserequisitions;
DELETE FROM quotationcomparisondetails;
DELETE FROM quotationcomparisons;
DELETE FROM supplierquotationitems;
DELETE FROM supplierquotations;
DELETE FROM rfqitems;
DELETE FROM requestforquotations;
DELETE FROM purchaseorderitems;
DELETE FROM purchaseorders;
DELETE FROM purchasereturnitems;
DELETE FROM purchasereturns;
DELETE FROM supplierinvoiceitems;
DELETE FROM supplierinvoices;
DELETE FROM supplieritems;
DELETE FROM supplier_banks;
DELETE FROM supplier_items;
DELETE FROM suppliers;

-- ========== مراقبة الجودة ==========
DELETE FROM qualityinspectionitems;
DELETE FROM qualityinspectionresults;
DELETE FROM qualityinspections;
DELETE FROM qualityparameters;

-- ========== المبيعات ==========
DELETE FROM salesinvoiceitems;
DELETE FROM salesinvoices;
DELETE FROM salesreturnitems;
DELETE FROM salesreturns;
DELETE FROM salesorderitems;
DELETE FROM salesorders;
DELETE FROM salesquotationitems;
DELETE FROM salesquotations;

-- ========== الوحدات ==========
DELETE FROM unitsofmeasure;

-- ========== إعادة تعيين AUTO_INCREMENT (اختياري) ==========
-- ALTER TABLE approvalrequests AUTO_INCREMENT = 1;
-- ALTER TABLE purchaserequisitions AUTO_INCREMENT = 1;
-- ... إلخ

SET FOREIGN_KEY_CHECKS = 1;

-- ========== ما تم الاحتفاظ به ==========
-- users, employees, roles, permissions, rolepermissions
-- departments, employeesalarystructure, salarycomponents
-- attendance, leaverequests
-- approvalworkflows, approvalworkflowsteps, approvallimits, alertrules
-- companyinfo, systemsettings
-- documenttypes, numberseries

SELECT 'تم التنظيف بنجاح - تم الاحتفاظ بـ: المستخدمين، الموظفين، الصلاحيات، الأدوار، الأقسام، إعدادات الموافقات، معلومات الشركة' AS Result;
