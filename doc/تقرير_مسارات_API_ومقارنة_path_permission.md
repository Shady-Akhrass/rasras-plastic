# تقرير مسارات API ومقارنتها بجدول path_permission

**النطاق:** جميع الـ Controllers في المشروع — استخراج المسارات الكاملة، طريقة HTTP، وجود @PreAuthorize، ومقارنة مع جدول `path_permission`.

**ملاحظة:** المسارات الفعلية تبدأ ببادئة الـ context path وهي `/api` (من `server.servlet.context-path=/api`)، لذا المسار الكامل = `/api` + مسار الـ Controller + مسار الـ Method.

---

## 1. القائمة الكاملة لمسارات API (Full API Paths)

| # | Method | Full Path | Controller | @PreAuthorize |
|---|--------|-----------|------------|----------------|
| 1 | GET | /api/auth/me | AuthController | لا |
| 2 | POST | /api/auth/login | AuthController | لا |
| 3 | POST | /api/auth/refresh | AuthController | لا |
| 4 | POST | /api/auth/change-password | AuthController | لا |
| 5 | GET | /api/company | CompanyController | لا |
| 6 | PUT | /api/company | CompanyController | نعم (SYSTEM_ADMIN_ONLY) |
| 7 | GET | /api/permissions | PermissionController | نعم (SYSTEM_ADMIN_ONLY) |
| 8 | GET | /api/permissions/path-rules | PermissionController | نعم (isAuthenticated) |
| 9 | GET | /api/permissions/path-audit | PermissionController | نعم (SYSTEM_ADMIN_ONLY) |
| 10 | GET | /api/roles | RoleController | نعم (SYSTEM_ADMIN_ONLY) |
| 11 | GET | /api/roles/{id} | RoleController | نعم (SYSTEM_ADMIN_ONLY) |
| 12 | POST | /api/roles | RoleController | نعم (SYSTEM_ADMIN_ONLY) |
| 13 | PUT | /api/roles/{id} | RoleController | نعم (SYSTEM_ADMIN_ONLY) |
| 14 | DELETE | /api/roles/{id} | RoleController | نعم (SYSTEM_ADMIN_ONLY) |
| 15 | POST | /api/roles/{id}/permissions | RoleController | نعم (SYSTEM_ADMIN_ONLY) |
| 16 | GET | /api/users | UserController | نعم (USER_MANAGEMENT) |
| 17 | GET | /api/users/{id} | UserController | نعم (USER_MANAGEMENT) |
| 18 | POST | /api/users | UserController | نعم (USER_MANAGEMENT) |
| 19 | PUT | /api/users/{id} | UserController | نعم (USER_MANAGEMENT) |
| 20 | DELETE | /api/users/{id} | UserController | نعم (USER_MANAGEMENT) |
| 21 | POST | /api/users/{id}/reset-password | UserController | نعم (SYSTEM_ADMIN_ONLY) |
| 22 | GET | /api/users/roles | UserController | نعم (SYSTEM_ADMIN_ONLY) |
| 23 | GET | /api/employees/me | EmployeeController | نعم (isAuthenticated) |
| 24 | PUT | /api/employees/me | EmployeeController | نعم (isAuthenticated) |
| 25 | GET | /api/employees | EmployeeController | نعم (EMPLOYEES_SECTION) |
| 26 | GET | /api/employees/list | EmployeeController | نعم (isAuthenticated) |
| 27 | GET | /api/employees/{id} | EmployeeController | نعم (EMPLOYEES_SECTION) |
| 28 | POST | /api/employees | EmployeeController | نعم (EMPLOYEES_SECTION) |
| 29 | PUT | /api/employees/{id} | EmployeeController | نعم (EMPLOYEES_SECTION) |
| 30 | DELETE | /api/employees/{id} | EmployeeController | نعم (EMPLOYEES_SECTION) |
| 31 | GET | /api/employees/departments | EmployeeController | نعم (isAuthenticated) |
| 32 | GET | /api/employees/by-department | EmployeeController | نعم (isAuthenticated) |
| 33 | GET | /api/employees/by-role | EmployeeController | نعم (isAuthenticated) |
| 34 | GET | /api/approvals/pending | ApprovalController | نعم (AUTHENTICATED) |
| 35 | GET | /api/approvals/audit | ApprovalController | نعم (APPROVAL_ACTION) |
| 36 | POST | /api/approvals/{id}/action | ApprovalController | نعم (APPROVAL_ACTION) |
| 37 | GET | /api/approval-limits | ApprovalLimitController | نعم (SYSTEM_ADMIN_ONLY) |
| 38 | GET | /api/approval-limits/role/{roleId} | ApprovalLimitController | نعم (SYSTEM_ADMIN_ONLY) |
| 39 | GET | /api/approval-limits/{id} | ApprovalLimitController | نعم (SYSTEM_ADMIN_ONLY) |
| 40 | PUT | /api/approval-limits/{id} | ApprovalLimitController | نعم (SYSTEM_ADMIN_ONLY) |
| 41 | GET | /api/settings | SystemSettingController | نعم (SYSTEM_ADMIN_ONLY) |
| 42 | GET | /api/settings/public | SystemSettingController | نعم (AUTHENTICATED) |
| 43 | GET | /api/settings/category/{category} | SystemSettingController | نعم (SYSTEM_ADMIN_ONLY) |
| 44 | PUT | /api/settings/{key} | SystemSettingController | نعم (SYSTEM_ADMIN_ONLY) |
| 45 | POST | /api/settings/database/restore | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 46 | GET | /api/settings/database/backup | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 47 | GET | /api/settings/database/overview | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 48 | GET | /api/settings/database/table/{tableName}/data | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 49 | GET | /api/settings/database/logs | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 50 | POST | /api/settings/database/execute-sql | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 51 | POST | /api/settings/database/clear-tables | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 52 | GET | /api/settings/database/error-logs | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 53 | POST | /api/settings/database/error-logs/clear | DatabaseController | نعم (SYSTEM_ADMIN_ONLY) |
| 54 | GET | /api/dashboard/stats | DashboardController | نعم (isAuthenticated) |
| 55 | POST | /api/upload | FileUploadController | لا |
| 56 | GET | /api/public/inventory/price-lists/selling | PublicPortalController | لا |
| 57 | POST | /api/public/crm/register | PublicPortalController | لا |
| 58 | GET | /api/procurement/pr | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 59 | GET | /api/procurement/pr/sales | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 60 | GET | /api/procurement/pr/{id} | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 61 | POST | /api/procurement/pr | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 62 | PUT | /api/procurement/pr/{id} | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 63 | POST | /api/procurement/pr/{id}/submit | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 64 | DELETE | /api/procurement/pr/{id} | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 65 | POST | /api/procurement/pr/{id}/delete | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 66 | GET | /api/procurement/pr/{id}/lifecycle | PurchaseRequisitionController | نعم (PROCUREMENT_SECTION) |
| 67 | GET | /api/procurement/po | PurchaseOrderController | نعم (PROCUREMENT_SECTION أو SUPPLIER_INVOICE_VIEW) |
| 68 | GET | /api/procurement/po/waiting | PurchaseOrderController | نعم (نفس الصلاحية) |
| 69 | GET | /api/procurement/po/uninvoiced | PurchaseOrderController | نعم (نفس الصلاحية) |
| 70 | GET | /api/procurement/po/{id} | PurchaseOrderController | نعم (نفس الصلاحية) |
| 71 | POST | /api/procurement/po | PurchaseOrderController | نعم (نفس الصلاحية) |
| 72 | POST | /api/procurement/po/{id}/submit | PurchaseOrderController | نعم (نفس الصلاحية) |
| 73 | POST | /api/procurement/po/{id}/mark-arrived | PurchaseOrderController | نعم (نفس الصلاحية) |
| 74 | DELETE | /api/procurement/po/{id} | PurchaseOrderController | نعم (نفس الصلاحية) |
| 75 | POST | /api/procurement/po/{id}/delete | PurchaseOrderController | نعم (نفس الصلاحية) |
| 76 | GET | /api/procurement/rfq | RFQController | نعم (PROCUREMENT_SECTION) |
| 77 | GET | /api/procurement/rfq/{id} | RFQController | نعم (PROCUREMENT_SECTION) |
| 78 | POST | /api/procurement/rfq | RFQController | نعم (PROCUREMENT_SECTION) |
| 79 | PUT | /api/procurement/rfq/{id} | RFQController | نعم (PROCUREMENT_SECTION) |
| 80 | DELETE | /api/procurement/rfq/{id} | RFQController | نعم (PROCUREMENT_SECTION) |
| 81 | POST | /api/procurement/rfq/{id}/delete | RFQController | نعم (PROCUREMENT_SECTION) |
| 82 | GET | /api/procurement/quotation | SupplierQuotationController | نعم (PROCUREMENT_SECTION) |
| 83 | GET | /api/procurement/quotation/{id} | SupplierQuotationController | نعم (PROCUREMENT_SECTION) |
| 84 | POST | /api/procurement/quotation | SupplierQuotationController | نعم (PROCUREMENT_SECTION) |
| 85 | PUT | /api/procurement/quotation/{id} | SupplierQuotationController | نعم (PROCUREMENT_SECTION) |
| 86 | DELETE | /api/procurement/quotation/{id} | SupplierQuotationController | نعم (PROCUREMENT_SECTION) |
| 87 | POST | /api/procurement/quotation/{id}/delete | SupplierQuotationController | نعم (PROCUREMENT_SECTION) |
| 88 | GET | /api/procurement/comparison | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 89 | GET | /api/procurement/comparison/{id} | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 90 | POST | /api/procurement/comparison | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 91 | PUT | /api/procurement/comparison/{id} | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 92 | DELETE | /api/procurement/comparison/{id} | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 93 | POST | /api/procurement/comparison/{id}/delete | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 94 | POST | /api/procurement/comparison/{id}/submit | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 95 | POST | /api/procurement/comparison/{id}/finance-review | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 96 | POST | /api/procurement/comparison/{id}/management-approve | QuotationComparisonController | نعم (PROCUREMENT_SECTION) |
| 97 | GET | /api/procurement/returns | PurchaseReturnController | نعم (PROCUREMENT_SECTION) |
| 98 | GET | /api/procurement/returns/{id} | PurchaseReturnController | نعم (PROCUREMENT_SECTION) |
| 99 | POST | /api/procurement/returns | PurchaseReturnController | نعم (PROCUREMENT_SECTION) |
| 100 | POST | /api/procurement/returns/{id}/approve | PurchaseReturnController | نعم (PROCUREMENT_SECTION) |
| 101 | DELETE | /api/procurement/returns/{id} | PurchaseReturnController | نعم (PROCUREMENT_SECTION) |
| 102 | POST | /api/procurement/returns/{id}/delete | PurchaseReturnController | نعم (PROCUREMENT_SECTION) |
| 103 | GET | /api/suppliers | SupplierController | نعم (PROCUREMENT_SECTION أو SUPPLIER_INVOICE_VIEW) |
| 104 | GET | /api/suppliers/{id} | SupplierController | نعم (نفس الصلاحية) |
| 105 | POST | /api/suppliers | SupplierController | نعم (نفس الصلاحية) |
| 106 | PUT | /api/suppliers/{id} | SupplierController | نعم (نفس الصلاحية) |
| 107 | DELETE | /api/suppliers/{id} | SupplierController | نعم (نفس الصلاحية) |
| 108 | GET | /api/suppliers/items-master | SupplierController | نعم (نفس الصلاحية) |
| 109 | GET | /api/suppliers/items-by-item/{itemId} | SupplierController | نعم (نفس الصلاحية) |
| 110 | GET | /api/suppliers/{id}/items | SupplierController | نعم (نفس الصلاحية) |
| 111 | POST | /api/suppliers/link-item | SupplierController | نعم (نفس الصلاحية) |
| 112 | DELETE | /api/suppliers/unlink-item/{id} | SupplierController | نعم (نفس الصلاحية) |
| 113 | GET | /api/suppliers/{id}/banks | SupplierController | نعم (نفس الصلاحية) |
| 114 | POST | /api/suppliers/add-bank | SupplierController | نعم (نفس الصلاحية) |
| 115 | DELETE | /api/suppliers/remove-bank/{id} | SupplierController | نعم (نفس الصلاحية) |
| 116 | POST | /api/suppliers/{id}/submit | SupplierController | نعم (نفس الصلاحية) |
| 117 | POST | /api/suppliers/{id}/approve | SupplierController | نعم (نفس الصلاحية) |
| 118 | POST | /api/suppliers/{id}/reject | SupplierController | نعم (نفس الصلاحية) |
| 119 | GET | /api/suppliers/outstanding-summary | SupplierController | نعم (نفس الصلاحية) |
| 120 | GET | /api/suppliers/invoices/pending-grns | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_CREATE) |
| 121 | GET | /api/suppliers/invoices/grn/{grnId} | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_CREATE_OR_REVIEW) |
| 122 | GET | /api/suppliers/invoices/{id}/match-details | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_REVIEW) |
| 123 | GET | /api/suppliers/invoices | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_VIEW) |
| 124 | GET | /api/suppliers/invoices/{id} | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_VIEW) |
| 125 | POST | /api/suppliers/invoices | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_CREATE) |
| 126 | POST | /api/suppliers/invoices/{id}/approve-payment | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_APPROVE) |
| 127 | GET | /api/suppliers/invoices/{id}/pdf | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_VIEW) |
| 128 | DELETE | /api/suppliers/invoices/{id} | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_CREATE) |
| 129 | POST | /api/suppliers/invoices/{id}/delete | SupplierInvoiceController | نعم (SUPPLIER_INVOICE_CREATE) |
| 130 | GET | /api/inventory/grn | GRNController | نعم (PROCUREMENT_SECTION) |
| 131 | GET | /api/inventory/grn/{id} | GRNController | نعم (PROCUREMENT_SECTION) |
| 132 | POST | /api/inventory/grn | GRNController | نعم (PROCUREMENT_SECTION) |
| 133 | PUT | /api/inventory/grn/{id} | GRNController | نعم (PROCUREMENT_SECTION) |
| 134 | POST | /api/inventory/grn/{id}/finalize | GRNController | نعم (PROCUREMENT_SECTION) |
| 135 | POST | /api/inventory/grn/{id}/submit | GRNController | نعم (PROCUREMENT_SECTION) |
| 136 | DELETE | /api/inventory/grn/{id} | GRNController | نعم (PROCUREMENT_SECTION) |
| 137 | POST | /api/inventory/grn/{id}/delete | GRNController | نعم (PROCUREMENT_SECTION) |
| 138 | GET | /api/inventory/items | ItemController | نعم (INVENTORY_ITEMS_ACCESS) |
| 139 | GET | /api/inventory/items/active | ItemController | نعم (INVENTORY_ITEMS_ACCESS) |
| 140 | GET | /api/inventory/items/{id} | ItemController | نعم (INVENTORY_ITEMS_ACCESS) |
| 141 | POST | /api/inventory/items | ItemController | نعم (INVENTORY_ITEMS_ACCESS) |
| 142 | PUT | /api/inventory/items/{id} | ItemController | نعم (INVENTORY_ITEMS_ACCESS) |
| 143 | DELETE | /api/inventory/items/{id} | ItemController | نعم (INVENTORY_ITEMS_ACCESS) |
| 144 | GET | /api/inventory/warehouses | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 145 | GET | /api/inventory/warehouses/active | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 146 | GET | /api/inventory/warehouses/{id} | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 147 | POST | /api/inventory/warehouses | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 148 | PUT | /api/inventory/warehouses/{id} | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 149 | POST | /api/inventory/warehouses/locations | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 150 | PUT | /api/inventory/warehouses/locations/{id} | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 151 | GET | /api/inventory/warehouses/{id}/locations | WarehouseController | نعم (WAREHOUSE_SECTION) |
| 152 | GET | /api/units | UnitController | نعم (WAREHOUSE_SECTION أو SUPPLIER_INVOICE_VIEW) |
| 153 | GET | /api/units/active | UnitController | نعم (نفس الصلاحية) |
| 154 | GET | /api/units/{id} | UnitController | نعم (نفس الصلاحية) |
| 155 | POST | /api/units | UnitController | نعم (نفس الصلاحية) |
| 156 | PUT | /api/units/{id} | UnitController | نعم (نفس الصلاحية) |
| 157 | DELETE | /api/units/{id} | UnitController | نعم (نفس الصلاحية) |
| 158 | GET | /api/inventory/categories | ItemCategoryController | نعم (INVENTORY_CATEGORIES_ACCESS) |
| 159 | GET | /api/inventory/categories/active | ItemCategoryController | نعم (INVENTORY_CATEGORIES_ACCESS) |
| 160 | GET | /api/inventory/categories/{id} | ItemCategoryController | نعم (INVENTORY_CATEGORIES_ACCESS) |
| 161 | POST | /api/inventory/categories | ItemCategoryController | نعم (INVENTORY_CATEGORIES_ACCESS) |
| 162 | PUT | /api/inventory/categories/{id} | ItemCategoryController | نعم (INVENTORY_CATEGORIES_ACCESS) |
| 163 | DELETE | /api/inventory/categories/{id} | ItemCategoryController | نعم (INVENTORY_CATEGORIES_ACCESS) |
| 164 | GET | /api/inventory/stocks | StockBalanceController | نعم (STOCKS_ACCESS) |
| 165 | GET | /api/inventory/stocks/{id} | StockBalanceController | نعم (STOCKS_ACCESS) |
| 166 | POST | /api/inventory/stocks | StockBalanceController | نعم (STOCKS_ACCESS) |
| 167 | PUT | /api/inventory/stocks/{id} | StockBalanceController | نعم (STOCKS_ACCESS) |
| 168 | DELETE | /api/inventory/stocks/{id} | StockBalanceController | نعم (STOCKS_ACCESS) |
| 169 | GET | /api/inventory/stocks/reports/periodic | StockBalanceController | نعم (STOCKS_ACCESS) |
| 170 | GET | /api/inventory/stocks/reports/below-min | StockBalanceController | نعم (STOCKS_ACCESS) |
| 171 | GET | /api/inventory/transfers | StockTransferController | نعم (WAREHOUSE_SECTION) |
| 172 | GET | /api/inventory/transfers/{id} | StockTransferController | نعم (WAREHOUSE_SECTION) |
| 173 | POST | /api/inventory/transfers | StockTransferController | نعم (WAREHOUSE_SECTION) |
| 174 | PUT | /api/inventory/transfers/{id} | StockTransferController | نعم (WAREHOUSE_SECTION) |
| 175 | POST | /api/inventory/transfers/{id}/finalize | StockTransferController | نعم (WAREHOUSE_SECTION) |
| 176 | GET | /api/inventory/adjustments | StockAdjustmentController | نعم (WAREHOUSE_SECTION) |
| 177 | GET | /api/inventory/adjustments/{id} | StockAdjustmentController | نعم (WAREHOUSE_SECTION) |
| 178 | GET | /api/inventory/adjustments/warehouse/{warehouseId} | StockAdjustmentController | نعم (WAREHOUSE_SECTION) |
| 179 | POST | /api/inventory/adjustments/count | StockAdjustmentController | نعم (WAREHOUSE_SECTION) |
| 180 | PUT | /api/inventory/adjustments/{id}/items | StockAdjustmentController | نعم (WAREHOUSE_SECTION) |
| 181 | POST | /api/inventory/adjustments/{id}/approve | StockAdjustmentController | نعم (WAREHOUSE_SECTION) |
| 182 | GET | /api/inventory/adjustments/variance-report | StockAdjustmentController | نعم (WAREHOUSE_SECTION) |
| 183 | GET | /api/inventory/quality-parameters | QualityParameterController | نعم (QUALITY_PARAMETERS_ACCESS) |
| 184 | GET | /api/inventory/quality-parameters/active | QualityParameterController | نعم (QUALITY_PARAMETERS_ACCESS) |
| 185 | POST | /api/inventory/quality-parameters | QualityParameterController | نعم (QUALITY_PARAMETERS_ACCESS) |
| 186 | PUT | /api/inventory/quality-parameters/{id} | QualityParameterController | نعم (QUALITY_PARAMETERS_ACCESS) |
| 187 | DELETE | /api/inventory/quality-parameters/{id} | QualityParameterController | نعم (QUALITY_PARAMETERS_ACCESS) |
| 188 | GET | /api/inventory/price-lists | PriceListController | نعم (PRICE_LISTS_ACCESS) |
| 189 | GET | /api/inventory/price-lists/{id} | PriceListController | نعم (PRICE_LISTS_ACCESS) |
| 190 | POST | /api/inventory/price-lists | PriceListController | نعم (PRICE_LISTS_ACCESS) |
| 191 | PUT | /api/inventory/price-lists/{id} | PriceListController | نعم (PRICE_LISTS_ACCESS) |
| 192 | DELETE | /api/inventory/price-lists/{id} | PriceListController | نعم (PRICE_LISTS_ACCESS) |
| 193 | POST | /api/inventory/quality-inspection/{grnId} | QualityInspectionController | نعم (WAREHOUSE_SECTION) |
| 194 | GET | /api/inventory/item-quality-specs/item/{itemId} | ItemQualitySpecController | نعم (WAREHOUSE_SECTION) |
| 195 | POST | /api/inventory/item-quality-specs | ItemQualitySpecController | نعم (WAREHOUSE_SECTION) |
| 196 | PUT | /api/inventory/item-quality-specs/{id} | ItemQualitySpecController | نعم (WAREHOUSE_SECTION) |
| 197 | DELETE | /api/inventory/item-quality-specs/{id} | ItemQualitySpecController | نعم (WAREHOUSE_SECTION) |
| 198 | GET | /api/inventory/material-issues | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 199 | GET | /api/inventory/material-issues/{id} | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 200 | GET | /api/inventory/material-issues/by-order/{salesOrderId} | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 201 | GET | /api/inventory/material-issues/check-stock | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 202 | POST | /api/inventory/material-issues/from-order/{salesOrderId} | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 203 | POST | /api/inventory/material-issues | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 204 | PUT | /api/inventory/material-issues/{id} | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 205 | DELETE | /api/inventory/material-issues/{id} | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 206 | POST | /api/inventory/material-issues/{id}/finalize | MaterialIssueController | نعم (WAREHOUSE_SECTION) |
| 207 | GET | /api/stock-movements | StockMovementController | نعم (WAREHOUSE_SECTION) |
| 208 | GET | /api/stock-movements/export | StockMovementController | نعم (WAREHOUSE_SECTION) |
| 209 | GET | /api/sales/orders | SalesOrderController | نعم (SALES_SECTION) |
| 210 | GET | /api/sales/orders/{id} | SalesOrderController | نعم (SALES_SECTION) |
| 211 | POST | /api/sales/orders | SalesOrderController | نعم (SALES_SECTION) |
| 212 | POST | /api/sales/orders/from-quotation/{quotationId} | SalesOrderController | نعم (SALES_SECTION) |
| 213 | PUT | /api/sales/orders/{id} | SalesOrderController | نعم (SALES_SECTION) |
| 214 | DELETE | /api/sales/orders/{id} | SalesOrderController | نعم (SALES_SECTION) |
| 215 | POST | /api/sales/orders/{id}/check-credit | SalesOrderController | نعم (SALES_SECTION) |
| 216 | POST | /api/sales/orders/{id}/submit | SalesOrderController | نعم (SALES_SECTION) |
| 217 | GET | /api/sales/quotations | SalesQuotationController | نعم (SALES_SECTION) |
| 218 | GET | /api/sales/quotations/{id} | SalesQuotationController | نعم (SALES_SECTION) |
| 219 | POST | /api/sales/quotations | SalesQuotationController | نعم (SALES_SECTION) |
| 220 | PUT | /api/sales/quotations/{id} | SalesQuotationController | نعم (SALES_SECTION) |
| 221 | DELETE | /api/sales/quotations/{id} | SalesQuotationController | نعم (SALES_SECTION) |
| 222 | POST | /api/sales/quotations/{id}/convert-to-order | SalesQuotationController | نعم (SALES_SECTION) |
| 223 | POST | /api/sales/quotations/{id}/submit | SalesQuotationController | نعم (SALES_SECTION) |
| 224 | GET | /api/sales/invoices | SalesInvoiceController | نعم (SALES_SECTION) |
| 225 | GET | /api/sales/invoices/{id} | SalesInvoiceController | نعم (SALES_SECTION) |
| 226 | POST | /api/sales/invoices | SalesInvoiceController | نعم (SALES_SECTION) |
| 227 | PUT | /api/sales/invoices/{id} | SalesInvoiceController | نعم (SALES_SECTION) |
| 228 | DELETE | /api/sales/invoices/{id} | SalesInvoiceController | نعم (SALES_SECTION) |
| 229 | POST | /api/sales/invoices/{id}/submit | SalesInvoiceController | نعم (SALES_SECTION) |
| 230 | GET | /api/sales/delivery-orders | DeliveryOrderController | نعم (SALES_SECTION) |
| 231 | GET | /api/sales/delivery-orders/{id} | DeliveryOrderController | نعم (SALES_SECTION) |
| 232 | GET | /api/sales/delivery-orders/by-issue-note/{issueNoteId} | DeliveryOrderController | نعم (SALES_SECTION) |
| 233 | POST | /api/sales/delivery-orders/from-issue-note/{issueNoteId} | DeliveryOrderController | نعم (SALES_SECTION) |
| 234 | POST | /api/sales/delivery-orders | DeliveryOrderController | نعم (SALES_SECTION) |
| 235 | PUT | /api/sales/delivery-orders/{id} | DeliveryOrderController | نعم (SALES_SECTION) |
| 236 | DELETE | /api/sales/delivery-orders/{id} | DeliveryOrderController | نعم (SALES_SECTION) |
| 237 | POST | /api/sales/delivery-orders/{id}/submit | DeliveryOrderController | نعم (SALES_SECTION) |
| 238 | GET | /api/sales/receipts | PaymentReceiptController | نعم (SALES_SECTION) |
| 239 | GET | /api/sales/receipts/{id} | PaymentReceiptController | نعم (SALES_SECTION) |
| 240 | POST | /api/sales/receipts | PaymentReceiptController | نعم (SALES_SECTION) |
| 241 | PUT | /api/sales/receipts/{id} | PaymentReceiptController | نعم (SALES_SECTION) |
| 242 | DELETE | /api/sales/receipts/{id} | PaymentReceiptController | نعم (SALES_SECTION) |
| 243 | POST | /api/sales/receipts/{id}/submit | PaymentReceiptController | نعم (SALES_SECTION) |
| 244 | GET | /api/sales/customer-requests | CustomerRequestController | نعم (SALES_SECTION) |
| 245 | GET | /api/sales/customer-requests/{id} | CustomerRequestController | نعم (SALES_SECTION) |
| 246 | POST | /api/sales/customer-requests | CustomerRequestController | نعم (SALES_SECTION) |
| 247 | PUT | /api/sales/customer-requests/{id} | CustomerRequestController | نعم (SALES_SECTION) |
| 248 | DELETE | /api/sales/customer-requests/{id} | CustomerRequestController | نعم (SALES_SECTION) |
| 249 | POST | /api/sales/customer-requests/{id}/approve | CustomerRequestController | نعم (SALES_SECTION) |
| 250 | POST | /api/sales/customer-requests/{id}/reject | CustomerRequestController | نعم (SALES_SECTION) |
| 251 | GET | /api/sales/issue-notes | StockIssueNoteController | نعم (SALES_SECTION) |
| 252 | GET | /api/sales/issue-notes/{id} | StockIssueNoteController | نعم (SALES_SECTION) |
| 253 | GET | /api/sales/issue-notes/by-order/{salesOrderId} | StockIssueNoteController | نعم (SALES_SECTION) |
| 254 | GET | /api/sales/issue-notes/check-stock | StockIssueNoteController | نعم (SALES_SECTION) |
| 255 | POST | /api/sales/issue-notes/from-order/{salesOrderId} | StockIssueNoteController | نعم (SALES_SECTION) |
| 256 | POST | /api/sales/issue-notes | StockIssueNoteController | نعم (SALES_SECTION) |
| 257 | PUT | /api/sales/issue-notes/{id} | StockIssueNoteController | نعم (SALES_SECTION) |
| 258 | DELETE | /api/sales/issue-notes/{id} | StockIssueNoteController | نعم (SALES_SECTION) |
| 259 | POST | /api/sales/issue-notes/{id}/approve | StockIssueNoteController | نعم (SALES_SECTION) |
| 260 | POST | /api/sales/issue-notes/{id}/submit | StockIssueNoteController | نعم (SALES_SECTION) |
| 261 | GET | /api/sales/vehicles | VehicleController | **لا** |
| 262 | GET | /api/sales/vehicles/active | VehicleController | **لا** |
| 263 | GET | /api/sales/vehicles/{id} | VehicleController | **لا** |
| 264 | POST | /api/sales/vehicles | VehicleController | **لا** |
| 265 | PUT | /api/sales/vehicles/{id} | VehicleController | **لا** |
| 266 | DELETE | /api/sales/vehicles/{id} | VehicleController | **لا** |
| 267 | GET | /api/crm/customers | CustomerController | نعم (CRM_SECTION) |
| 268 | GET | /api/crm/customers/active | CustomerController | نعم (CRM_SECTION) |
| 269 | GET | /api/crm/customers/{id} | CustomerController | نعم (CRM_SECTION) |
| 270 | POST | /api/crm/customers | CustomerController | نعم (CRM_SECTION) |
| 271 | PUT | /api/crm/customers/{id} | CustomerController | نعم (CRM_SECTION) |
| 272 | DELETE | /api/crm/customers/{id} | CustomerController | نعم (CRM_SECTION) |
| 273 | GET | /api/finance/payment-vouchers | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 274 | GET | /api/finance/payment-vouchers/suppliers-with-pending-invoices | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 275 | GET | /api/finance/payment-vouchers/invoice-comparison/{supplierId} | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 276 | GET | /api/finance/payment-vouchers/unpaid-invoices | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 277 | GET | /api/finance/payment-vouchers/{id} | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 278 | POST | /api/finance/payment-vouchers | PaymentVoucherController | نعم (SUPPLIER_INVOICE_PAY على الـ method) |
| 279 | GET | /api/finance/payment-vouchers/{id}/pdf | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 280 | POST | /api/finance/payment-vouchers/{id}/approve-finance | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 281 | POST | /api/finance/payment-vouchers/{id}/approve-general | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 282 | POST | /api/finance/payment-vouchers/{id}/reject | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 283 | POST | /api/finance/payment-vouchers/{id}/process-payment | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 284 | POST | /api/finance/payment-vouchers/{id}/cancel | PaymentVoucherController | نعم (FINANCE_SECTION) |
| 285 | GET | /api/journal-entries | JournalEntryController | نعم (ACCOUNTING_VIEW) |
| 286 | GET | /api/journal-entries/{id} | JournalEntryController | نعم (ACCOUNTING_VIEW) |
| 287 | GET | /api/journal-entries/number/{entryNumber} | JournalEntryController | نعم (ACCOUNTING_VIEW) |
| 288 | POST | /api/journal-entries | JournalEntryController | نعم (ACCOUNTING_CREATE) |
| 289 | PUT | /api/journal-entries/{id} | JournalEntryController | نعم (ACCOUNTING_UPDATE) |
| 290 | DELETE | /api/journal-entries/{id} | JournalEntryController | نعم (ACCOUNTING_DELETE) |
| 291 | POST | /api/journal-entries/{id}/post | JournalEntryController | نعم (ACCOUNTING_POST) |
| 292 | GET | /api/journal-entries/by-date-range | JournalEntryController | نعم (ACCOUNTING_VIEW) |
| 293 | GET | /api/journal-entries/by-status | JournalEntryController | نعم (ACCOUNTING_VIEW) |
| 294 | GET | /api/journal-entries/by-fiscal-year | JournalEntryController | نعم (ACCOUNTING_VIEW) |
| 295 | GET | /api/journal-entries/by-source | JournalEntryController | نعم (ACCOUNTING_VIEW) |
| 296 | GET | /api/hr/leave-types | HrController | نعم (EMPLOYEES_SECTION) |
| 297 | PUT | /api/hr/leave-types/{code} | HrController | نعم (EMPLOYEES_SECTION) |
| 298 | DELETE | /api/hr/leave-types/{code} | HrController | نعم (EMPLOYEES_SECTION) |
| 299 | GET | /api/hr/shifts | HrController | نعم (EMPLOYEES_SECTION) |
| 300 | POST | /api/hr/shifts | HrController | نعم (EMPLOYEES_SECTION) |
| 301 | PUT | /api/hr/shifts/{id} | HrController | نعم (EMPLOYEES_SECTION) |
| 302 | DELETE | /api/hr/shifts/{id} | HrController | نعم (EMPLOYEES_SECTION) |
| 303 | GET | /api/hr/holidays | HrController | نعم (EMPLOYEES_SECTION) |
| 304 | POST | /api/hr/holidays | HrController | نعم (EMPLOYEES_SECTION) |
| 305 | PUT | /api/hr/holidays/{id} | HrController | نعم (EMPLOYEES_SECTION) |
| 306 | DELETE | /api/hr/holidays/{id} | HrController | نعم (EMPLOYEES_SECTION) |
| 307 | GET | /api/hr/employee-shifts | HrController | نعم (EMPLOYEES_SECTION) |
| 308 | POST | /api/hr/employee-shifts | HrController | نعم (EMPLOYEES_SECTION) |
| 309 | PUT | /api/hr/employee-shifts/{id} | HrController | نعم (EMPLOYEES_SECTION) |
| 310 | DELETE | /api/hr/employee-shifts/{id} | HrController | نعم (EMPLOYEES_SECTION) |
| 311 | GET | /api/hr/attendance | HrController | نعم (EMPLOYEES_SECTION) |
| 312 | POST | /api/hr/attendance | HrController | نعم (EMPLOYEES_SECTION) |
| 313 | PUT | /api/hr/attendance/{id} | HrController | نعم (EMPLOYEES_SECTION) |
| 314 | GET | /api/hr/payroll | HrController | نعم (EMPLOYEES_SECTION) |
| 315 | POST | /api/hr/payroll/generate | HrController | نعم (EMPLOYEES_SECTION) |

**الإجمالي: 315 مسار API فعلي.**

---

## 2. مصدر بيانات جدول path_permission

- **في المشروع:** لا يوجد أي `INSERT` لجدول `path_permission` في الكود (لا في DataSeeder ولا في migrations ولا في أي سكربت).
- **الجدول:** مُنشأ فقط عبر migration `V1__create_path_permission_table.sql` (هيكل الجدول فقط).
- **النتيجة:** أي قواعد موجودة في الجدول تكون قد أُضيفت **يدوياً** أو عبر سكربت خارجي. للمقارنة التالية يُفترض أن الجدول **فارغ** ما لم يُؤكد خلاف ذلك.

---

## 3. المسارات الموجودة في الكود وغير الموجودة في path_permission

بما أنه **لا يوجد إدخال لقواعد path_permission من المشروع**، فإن **جميع** مسارات API المذكورة أعلاه (عدا المسارات المستثناة في Whitelist) **غير مغطاة** بقواعد في الجدول عند التشغيل الافتراضي.

### 3.1 مسارات مستثناة (Whitelist) — لا تحتاج قواعد path_permission

هذه لا تُرفض بفلتر path_permission أصلاً:

| المسار أو البادئة | الملاحظة |
|-------------------|----------|
| /api/auth/* | login, refresh ضمن Whitelist |
| /api/settings/public | Whitelist |
| /api/swagger-ui, /api/v3/api-docs, /api/api-docs | Whitelist |
| /api/actuator | Whitelist |
| /api/uploads/ | Whitelist |
| /api/public/* | Whitelist |

### 3.2 جميع المسارات غير المغلفة (تحتاج قواعد إذا كان Default Deny مفعّلاً)

كل مسار في القائمة الكاملة في القسم 1 **ما عدا** التي تطابق Whitelist أعلاه تُعتبر **غير مغطاة** في path_permission عند جدول فارغ، ومنها:

- **مصادقة وإعدادات:** `/api/auth/me`, `/api/auth/change-password`, `/api/company` (GET, PUT), `/api/settings` (كل الطرق عدا public), `/api/settings/database/**`, `/api/dashboard/stats`, `/api/upload`
- **صلاحيات وأدوار ومستخدمون:** `/api/permissions/**`, `/api/roles/**`, `/api/users/**`
- **اعتمادات وإعدادات حدود:** `/api/approvals/**`, `/api/approval-limits/**`
- **موظفون وـ HR:** `/api/employees/**`, `/api/hr/**`
- **مشتريات وموردون:** `/api/procurement/**`, `/api/suppliers/**`
- **مخزون ووحدات وحركات:** `/api/inventory/**`, `/api/units/**`, `/api/stock-movements/**`
- **مبيعات وعملاء ومالية ومحاسبة:** `/api/sales/**`, `/api/crm/**`, `/api/finance/**`, `/api/journal-entries/**`

**الخلاصة:** عدد المسارات **غير المغلفة** = (عدد المسارات الفعلية) − (المسارات المطابقة لـ Whitelist). المسارات المطابقة لـ Whitelist هي جزء من `/api/auth/`, `/api/settings/public`, `/api/public/`، إلخ. باقي الـ **315** مساراً إما تطابق Whitelist (عدد محدود) أو غير مغطاة؛ عملياً **أغلب الـ 315 مساراً غير مغطاة** عند جدول فارغ.

---

## 4. القواعد الموجودة في path_permission ولا تطابق أي endpoint

- **من الكود:** لا يُضاف أي سجل إلى `path_permission`، لذا لا يمكن استنتاج قواعد "في الكود" للمقارنة.
- **من قاعدة البيانات:** إذا وُجدت قواعد مُدخلة يدوياً في DB فيُنصح بـ:
  1. تشغيل **GET /api/permissions/path-audit** (بعد إتاحة الوصول لها) لمعرفة المسارات المغطاة وغير المغطاة.
  2. مقارنة أنماط المسارات المخزنة في الجدول (PathPattern, HttpMethod) مع القائمة الكاملة أعلاه؛ أي نمط لا يطابق أي مسار فعلي (مع Ant-style matching) يُعتبر **قاعدة لا تطابق أي endpoint** ويُفضّل مراجعتها أو إزالتها.

في الوضع الافتراضي (جدول فارغ): **لا توجد قواعد للمقارنة**، فالنتيجة "لا توجد قواعد في path_permission لا تطابق أي endpoint".

---

## 5. المسارات الحساسة غير المحمية أو المحمية فقط بـ isAuthenticated

المسارات التالية تُعتبر **حساسة** (تتعلق بمصادقة، صلاحيات، أدوار، مستخدمين، إعدادات، شركة، رفع ملفات)، وهي إما **بدون @PreAuthorize** أو محمية فقط بـ **isAuthenticated()** (أي أي مستخدم مصادق يمكنه استدعاءها):

| Method | Full Path | Controller | الحماية الحالية |
|--------|-----------|------------|------------------|
| GET | /api/auth/me | AuthController | لا يوجد @PreAuthorize — تعتمد على أن الطلب مصادق (Spring Security) |
| POST | /api/auth/change-password | AuthController | لا يوجد @PreAuthorize — تعتمد على المصادقة فقط |
| GET | /api/company | CompanyController | لا يوجد @PreAuthorize — SecurityConfig يسمح بـ permitAll لـ GET /company |
| POST | /api/upload | FileUploadController | لا يوجد @PreAuthorize — أي مستخدم مصادق يمكنه الرفع |
| GET | /api/permissions/path-rules | PermissionController | @PreAuthorize("isAuthenticated()") — أي مصادق يرى قواعد المسارات |
| GET | /api/sales/vehicles | VehicleController | **لا يوجد @PreAuthorize** — أي مصادق يصل لمركبات المبيعات |
| GET | /api/sales/vehicles/active | VehicleController | **لا** |
| GET | /api/sales/vehicles/{id} | VehicleController | **لا** |
| POST | /api/sales/vehicles | VehicleController | **لا** |
| PUT | /api/sales/vehicles/{id} | VehicleController | **لا** |
| DELETE | /api/sales/vehicles/{id} | VehicleController | **لا** |

### مسارات عامة بالتصميم (بدون مصادقة مطلوبة)

| Method | Full Path | الملاحظة |
|--------|-----------|----------|
| POST | /api/auth/login | عام — تسجيل الدخول |
| POST | /api/auth/refresh | عام — تحديث التوكن |
| GET | /api/public/inventory/price-lists/selling | عام — بوابة عامة |
| POST | /api/public/crm/register | عام — تسجيل عميل |

### توصيات للمسارات الحساسة أعلاه

1. **GET /api/company:** إما إبقاؤه عاماً (permitAll) وإضافته صراحة إلى Whitelist في PathPermissionFilter إن لزم، أو ربطه بصلاحية محددة إذا أردت تقييد العرض.
2. **POST /api/upload:** يُفضّل حمايته بصلاحية مناسبة (مثلاً صلاحية رفع الملفات أو قسم معيّن) بدلاً من الاعتماد على المصادقة فقط.
3. **GET /api/permissions/path-rules:** حالياً متاح لأي مصادق؛ إذا أردت تقييده (مثلاً أدمن فقط) يمكن استبدال `isAuthenticated()` بصلاحية مثل SECTION_SYSTEM.
4. **GET /api/auth/me و POST /api/auth/change-password:** الاعتماد على المصادقة فقط قد يكون كافياً؛ إضافة @PreAuthorize("isAuthenticated()") يوضح القصد ولا يغيّر السلوك عملياً.

---

## 6. ملخص الأرقام

| البند | العدد |
|-------|--------|
| إجمالي مسارات API المستخرجة من الـ Controllers | 315 |
| مسارات بدون @PreAuthorize (حساسة أو عامة) | 14 (auth/me, auth/change-password, GET company, upload, path-rules isAuthenticated، + 6 مسارات sales/vehicles) |
| مسارات محمية بـ @PreAuthorize (class أو method) | 301 |
| قواعد path_permission مُدخلة من المشروع | 0 |
| مسارات غير مغطاة في path_permission (عند جدول فارغ) | كل المسارات غير المطابقة لـ Whitelist |

---

*هذا التقرير تحليلي فقط ولم يتم تعديل أي كود في المشروع.*
