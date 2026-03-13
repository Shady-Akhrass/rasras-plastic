package com.rasras.erp.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final com.rasras.erp.approval.ApprovalWorkflowRepository workflowRepo;
    private final com.rasras.erp.approval.ApprovalWorkflowStepRepository stepRepo;
    private final com.rasras.erp.approval.ApprovalLimitRepository limitRepo;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PathPermissionRepository pathPermissionRepository;
    private final PathPermissionService pathPermissionService;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting data seeding for Employees and Users...");

        // 0. Ensure Roles exist first
        seedRoles();

        // 0.05 صلاحيات الأقسام (للعرض الديناميكي في القائمة الجانبية)
        seedSectionPermissions();

        // 0.055 صلاحيات عناصر القائمة الجانبية (MENU_*) — للتحكم بكل عنصر لكل دور
        seedMenuItemPermissions();

        // 0.06 تعيين صلاحيات الأقسام للأدوار الافتراضية (يعمل تلقائياً عند أول تشغيل)
        seedDefaultRoleSectionPermissions();

        // 0.065 تعيين عناصر القائمة (MENU_*) للأدوار حتى يعمل السايد بار حسب النهج
        // الجديد
        seedMenuRoleAssignments();

        // 0.07 صلاحيات الأفعال (ACCOUNTING_*, إلخ) وتعيينها للأدوار المناسبة
        seedActionPermissions();

        // 0.08 قواعد path_permission (ربط مسارات API بصلاحيات)
        seedPathPermissions();

        // 0.1 Seed Approval Workflows
        seedApprovalWorkflows();

        // 0.2 Seed Approval Limits (حدود الاعتماد المالية)
        seedApprovalLimits();

        // 1. Ensure Department 1 exists (needed for employee)
        Integer deptCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM departments WHERE DepartmentID = 1", Integer.class);
        if (deptCount == null || deptCount == 0) {
            log.info("Seeding default department...");
            jdbcTemplate.update(
                    "INSERT INTO departments (DepartmentID, DepartmentCode, DepartmentNameAr, DepartmentNameEn, IsActive) VALUES (1, 'MGT', 'الإدارة', 'Management', 1)");
        }

        // 2. Ensure Employee 103 exists (needed for user 'shady')
        Integer empCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM employees WHERE EmployeeID = 103", Integer.class);
        if (empCount == null || empCount == 0) {
            log.info("Seeding employee 103...");
            jdbcTemplate.update(
                    "INSERT INTO employees (EmployeeID, EmployeeCode, FirstNameAr, LastNameAr, FirstNameEn, LastNameEn, DepartmentID, HireDate, IsActive) "
                            +
                            "VALUES (103, 'EMP103', 'شادي', 'محمد', 'Shady', 'Mohamed', 1, CURDATE(), 1)");
        }

        // 3. Ensure 'shady' user exists
        if (!userRepository.existsByUsername("shady")) {
            log.info("Fetching ADMIN role...");
            Role adminRole = roleRepository.findByRoleCode("ADMIN")
                    .orElseThrow(() -> new RuntimeException(
                            "ADMIN role not found in database! Please ensure roles are seeded."));

            log.info("Creating 'shady' user...");
            User shady = User.builder()
                    .username("shady")
                    .passwordHash(passwordEncoder.encode("12345678"))
                    .employeeId(103)
                    .role(adminRole)
                    .isActive(true)
                    .isLocked(false)
                    .failedLoginAttempts(0)
                    .build();
            userRepository.save(shady);
            log.info("'shady' user seeded successfully with password '12345678'");
        } else {
            log.info("'shady' user already exists, skipping...");
        }

        log.info("Data seeding completed.");
    }

    private void seedRoles() {
        log.info("Seeding roles...");

        // Check and create ADMIN role
        if (!roleRepository.findByRoleCode("ADMIN").isPresent()) {
            log.info("Creating ADMIN role...");
            Role adminRole = Role.builder()
                    .roleCode("ADMIN")
                    .roleNameAr("مدير النظام")
                    .roleNameEn("System Administrator")
                    .description("صلاحيات كاملة على النظام")
                    .isActive(true)
                    .build();
            roleRepository.save(adminRole);
            log.info("ADMIN role created successfully");
        }

        // Check and create other common roles
        String[][] roles = {
                { "GM", "المدير العام", "General Manager", "الإدارة العليا واعتماد القرارات" },
                { "FM", "المدير المالي", "Finance Manager", "إدارة الشؤون المالية" },
                { "ACC", "محاسب", "Accountant", "العمليات المحاسبية اليومية" },
                { "PM", "مدير المشتريات", "Procurement Manager", "إدارة عمليات الشراء" },
                { "BUYER", "مشتري", "Buyer", "تنفيذ عمليات الشراء" },
                { "SM", "مدير المبيعات", "Sales Manager", "إدارة عمليات البيع" },
                { "WHM", "أمين المخزن", "Warehouse Keeper", "إدارة المخازن والجرد" },
                { "QC", "مراقب الجودة", "Quality Controller", "فحص واعتماد الجودة" }
        };

        for (String[] roleData : roles) {
            if (!roleRepository.findByRoleCode(roleData[0]).isPresent()) {
                Role role = Role.builder()
                        .roleCode(roleData[0])
                        .roleNameAr(roleData[1])
                        .roleNameEn(roleData[2])
                        .description(roleData[3])
                        .isActive(true)
                        .build();
                roleRepository.save(role);
                log.info("Created role: {}", roleData[0]);
            }
        }
    }

    /**
     * إنشاء صلاحيات الأقسام وتعيينها لـ ADMIN حتى تعمل القائمة والمسارات ديناميكياً
     * من لوحة التحكم
     */
    private void seedSectionPermissions() {
        log.info("Seeding section permissions...");
        String[][] sectionPerms = {
                { "SECTION_MAIN", "الرئيسية والاعتمادات", "Main & Approvals", "MENU" },
                { "SECTION_USERS", "المستخدمين", "Users", "MENU" },
                { "SECTION_EMPLOYEES", "الموظفين", "Employees", "MENU" },
                { "SECTION_WAREHOUSE", "المخازن", "Warehouse", "MENU" },
                { "SECTION_OPERATIONS", "العمليات", "Operations", "MENU" },
                { "SECTION_SALES", "المبيعات", "Sales", "MENU" },
                { "SECTION_CRM", "العملاء (CRM)", "CRM", "MENU" },
                { "SECTION_PROCUREMENT", "المشتريات", "Procurement", "MENU" },
                { "SECTION_FINANCE", "المالية", "Finance", "MENU" },
                { "SECTION_SYSTEM", "إعدادات النظام", "System Settings", "MENU" },
                { "INVENTORY_VIEW", "عرض المخزون", "View Inventory", "VIEW" },
        };
        for (String[] p : sectionPerms) {
            if (permissionRepository.findByPermissionCode(p[0]).isEmpty()) {
                Permission perm = Permission.builder()
                        .permissionCode(p[0])
                        .permissionNameAr(p[1])
                        .permissionNameEn(p[2])
                        .moduleName(p[3])
                        .isActive(true)
                        .build();
                permissionRepository.save(perm);
                log.info("Created permission: {}", p[0]);
            }
        }
        Role adminRole = roleRepository.findByRoleCode("ADMIN").orElse(null);
        if (adminRole != null) {
            List<Permission> sectionPermissions = sectionPerms.length > 0
                    ? java.util.Arrays.stream(sectionPerms)
                            .map(sp -> permissionRepository.findByPermissionCode(sp[0]).orElse(null))
                            .filter(perm -> perm != null)
                            .collect(java.util.stream.Collectors.toList())
                    : java.util.Collections.emptyList();
            for (Permission perm : sectionPermissions) {
                boolean alreadyAssigned = rolePermissionRepository.findByRoleRoleId(adminRole.getRoleId()).stream()
                        .anyMatch(rp -> rp.getPermission().getPermissionId().equals(perm.getPermissionId()));
                if (!alreadyAssigned) {
                    rolePermissionRepository.save(RolePermission.builder()
                            .role(adminRole)
                            .permission(perm)
                            .isAllowed(true)
                            .build());
                    log.info("Assigned permission {} to ADMIN", perm.getPermissionCode());
                }
            }
        }
    }

    /**
     * تعيين صلاحيات الأقسام للأدوار الافتراضية حتى يعمل السايد بار تلقائياً دون
     * تعيين يدوي
     */
    private void seedDefaultRoleSectionPermissions() {
        log.info("Seeding default role section permissions...");
        List<String> allSectionCodes = java.util.Arrays.asList(
                "SECTION_MAIN", "SECTION_USERS", "SECTION_EMPLOYEES", "SECTION_WAREHOUSE",
                "SECTION_OPERATIONS", "SECTION_SALES", "SECTION_CRM", "SECTION_PROCUREMENT",
                "SECTION_FINANCE", "SECTION_SYSTEM", "INVENTORY_VIEW");
        java.util.Map<String, java.util.List<String>> roleSectionMap = new java.util.HashMap<>();
        roleSectionMap.put("PM", java.util.Arrays.asList("SECTION_MAIN", "SECTION_PROCUREMENT"));
        roleSectionMap.put("BUYER", java.util.Arrays.asList("SECTION_MAIN", "SECTION_PROCUREMENT"));
        roleSectionMap.put("SM", java.util.Arrays.asList("SECTION_MAIN", "SECTION_SALES", "SECTION_CRM"));
        roleSectionMap.put("WHM", java.util.Arrays.asList("SECTION_MAIN", "SECTION_WAREHOUSE", "INVENTORY_VIEW"));
        roleSectionMap.put("QC", java.util.Arrays.asList("SECTION_MAIN", "SECTION_OPERATIONS"));
        roleSectionMap.put("GM", allSectionCodes);
        roleSectionMap.put("FM", java.util.Arrays.asList("SECTION_MAIN", "SECTION_FINANCE"));
        roleSectionMap.put("ACC", java.util.Arrays.asList("SECTION_MAIN", "SECTION_FINANCE"));

        for (java.util.Map.Entry<String, java.util.List<String>> e : roleSectionMap.entrySet()) {
            Role role = roleRepository.findByRoleCode(e.getKey()).orElse(null);
            if (role == null)
                continue;
            for (String permCode : e.getValue()) {
                assignPermissionToRole(role, permCode);
            }
        }
    }

    /**
     * صلاحيات عناصر القائمة الجانبية (MENU_*) — عنصر واحد لكل رابط في السايد بار
     * للتحكم من صفحة الأدوار والصلاحيات بمحتوى كل قائمة منسدلة لكل دور.
     */
    private void seedMenuItemPermissions() {
        log.info("Seeding menu item permissions (MENU_*)...");
        String[][] menuPerms = {
                // الرئيسية
                { "MENU_MAIN_DASHBOARD", "لوحة القيادة", "Dashboard" },
                { "MENU_MAIN_APPROVALS", "الطلبات والاعتمادات", "Approvals" },
                { "MENU_MAIN_APPROVALS_AUDIT", "سجل الاعتماد", "Approval Audit" },
                { "MENU_MAIN_USERS", "المستخدمين", "Users" },
                { "MENU_MAIN_EMPLOYEE_DATA", "بيانات الموظف", "Employee Data" },
                // الموارد البشرية
                { "MENU_HR_EMPLOYEES", "الموظفين", "Employees" },
                { "MENU_HR_LEAVE_TYPES", "أنواع الإجازات", "Leave Types" },
                { "MENU_HR_SHIFTS", "الشفتات", "Shifts" },
                { "MENU_HR_HOLIDAYS", "العطلات", "Holidays" },
                { "MENU_HR_EMPLOYEE_SHIFTS", "شفتات الموظفين", "Employee Shifts" },
                { "MENU_HR_ATTENDANCE", "الحضور والانصراف", "Attendance" },
                { "MENU_HR_PAYROLL", "المرتبات", "Payroll" },
                // المشتريات
                { "MENU_PROCUREMENT_PR", "طلبات الشراء (PR)", "Purchase Requisitions" },
                { "MENU_PROCUREMENT_RFQ", "طلبات عروض الأسعار (RFQ)", "RFQ" },
                { "MENU_PROCUREMENT_QUOTATION", "عروض الموردين", "Quotations" },
                { "MENU_PROCUREMENT_COMPARISON", "مقارنة العروض (QCS)", "Comparison" },
                { "MENU_PROCUREMENT_PO", "أوامر الشراء (PO)", "Purchase Orders" },
                { "MENU_PROCUREMENT_WAITING_IMPORTS", "الشحنات القادمة", "Waiting Imports" },
                { "MENU_PROCUREMENT_GRN", "إذن استلام (GRN)", "GRN" },
                { "MENU_PROCUREMENT_INVOICES", "فواتير الموردين", "Supplier Invoices" },
                { "MENU_PROCUREMENT_OUTSTANDING", "الأرصدة المستحقة", "Outstanding" },
                { "MENU_PROCUREMENT_RETURNS", "مرتجعات الشراء", "Returns" },
                { "MENU_PROCUREMENT_SUPPLIERS", "الموردين", "Suppliers" },
                // المبيعات
                { "MENU_SALES_SECTIONS", "قسم المبيعات", "Sales Sections" },
                { "MENU_SALES_PURCHASE_REQUISITIONS", "طلبات الشراء", "Purchase Requisitions" },
                { "MENU_SALES_CUSTOMER_REQUESTS", "طلبات العملاء", "Customer Requests" },
                { "MENU_SALES_QUOTATIONS", "عروض الأسعار", "Quotations" },
                { "MENU_SALES_ORDERS", "أوامر البيع (SO)", "Sales Orders" },
                { "MENU_SALES_ISSUE_NOTES", "إذونات الصرف", "Issue Notes" },
                { "MENU_SALES_DELIVERY_ORDERS", "أوامر التوصيل", "Delivery Orders" },
                { "MENU_SALES_VEHICLES", "المركبات", "Vehicles" },
                { "MENU_SALES_INVOICES", "فواتير المبيعات", "Sales Invoices" },
                { "MENU_SALES_RECEIPTS", "إيصالات الدفع", "Receipts" },
                { "MENU_SALES_OUTSTANDING", "أرصدة العملاء", "Customer Outstanding" },
                // العملاء (CRM)
                { "MENU_CRM_CUSTOMERS", "العملاء", "Customers" },
                // المالية
                { "MENU_FINANCE_INVOICES", "فواتير الموردين", "Supplier Invoices" },
                { "MENU_FINANCE_PAYMENT_VOUCHERS", "سندات الدفع", "Payment Vouchers" },
                { "MENU_FINANCE_PAYMENT_VOUCHERS_NEW", "سند صرف جديد", "New Payment Voucher" },
                // المخازن
                { "MENU_WAREHOUSE_SECTIONS", "أقسام المخزن", "Sections" },
                { "MENU_WAREHOUSE_WAREHOUSES", "المستودعات", "Warehouses" },
                { "MENU_WAREHOUSE_STOCKS", "أرصدة المخزون", "Stocks" },
                { "MENU_WAREHOUSE_ISSUE", "إذن صرف", "Issue" },
                { "MENU_WAREHOUSE_TRANSFER", "تحويل بين مخازن", "Transfer" },
                { "MENU_WAREHOUSE_BELOW_MIN", "الأصناف تحت الحد الأدنى", "Below Min" },
                { "MENU_WAREHOUSE_STAGNANT", "الأصناف الراكدة", "Stagnant" },
                { "MENU_WAREHOUSE_MOVEMENT", "حركة الصنف التفصيلية", "Movement" },
                { "MENU_WAREHOUSE_COUNT", "جرد دوري", "Count" },
                { "MENU_WAREHOUSE_COUNT_SURPRISE", "جرد مفاجئ", "Surprise Count" },
                { "MENU_WAREHOUSE_PERIODIC_INVENTORY", "تقرير المخزون الدوري", "Periodic Inventory" },
                { "MENU_WAREHOUSE_VARIANCE", "تقرير الفروقات", "Variance" },
                { "MENU_WAREHOUSE_CATEGORIES", "تصنيفات الأصناف", "Item Categories" },
                { "MENU_WAREHOUSE_ITEMS", "الأصناف", "Items" },
                // العمليات (فحص الجودة، معاملات الجودة، قوائم الأسعار فقط — التصنيفات والأصناف
                // تحت المخزون)
                { "MENU_OPERATIONS_CATEGORIES", "تصنيفات الأصناف", "Categories" },
                { "MENU_OPERATIONS_ITEMS", "الأصناف", "Items" },
                { "MENU_WAREHOUSE_QUALITY_INSPECTION", "فحص الجودة", "Quality Inspection" },
                { "MENU_WAREHOUSE_QUALITY_PARAMETERS", "معاملات الجودة", "Quality Parameters" },
                { "MENU_OPERATIONS_CATEGORIES", "تصنيفات الأصناف (عمليات)", "Categories (legacy)" },
                { "MENU_OPERATIONS_ITEMS", "الأصناف (عمليات)", "Items (legacy)" },
                { "MENU_OPERATIONS_PRICE_LISTS", "قوائم الأسعار", "Price Lists" },
                // النظام
                { "MENU_SYSTEM_COMPANY", "بيانات الشركة", "Company" },
                { "MENU_SYSTEM_UNITS", "وحدات القياس", "Units" },
                { "MENU_SYSTEM_SETTINGS", "إعدادات النظام", "System Settings" },
                { "MENU_SYSTEM_USERS", "إدارة المستخدمين", "Users" },
                { "MENU_SYSTEM_ROLES", "الأدوار والصلاحيات", "Roles" },
                { "MENU_SYSTEM_PERMISSIONS", "سجل الصلاحيات", "Permissions" },
                { "MENU_SYSTEM_SECURITY", "الأمان والخصوصية", "Security" },
                { "MENU_SYSTEM_NOTIFICATIONS", "الإشعارات", "Notifications" },
                { "MENU_SYSTEM_DATABASE", "قاعدة البيانات", "Database" },
        };
        for (String[] p : menuPerms) {
            if (permissionRepository.findByPermissionCode(p[0]).isEmpty()) {
                Permission perm = Permission.builder()
                        .permissionCode(p[0])
                        .permissionNameAr(p[1])
                        .permissionNameEn(p[2])
                        .moduleName("MENU")
                        .isActive(true)
                        .build();
                permissionRepository.save(perm);
                log.info("Created menu permission: {}", p[0]);
            }
        }
    }

    /**
     * تعيين صلاحيات عناصر القائمة (MENU_*) للأدوار — ADMIN و GM كل العناصر،
     * وباقي الأدوار حسب الأقسام (مثل PM: الرئيسية + المشتريات).
     */
    private void seedMenuRoleAssignments() {
        log.info("Seeding menu item assignments to roles...");
        List<String> menuPrefixes = java.util.Arrays.asList(
                "MENU_MAIN_", "MENU_HR_", "MENU_PROCUREMENT_", "MENU_SALES_", "MENU_CRM_",
                "MENU_FINANCE_", "MENU_WAREHOUSE_", "MENU_OPERATIONS_", "MENU_SYSTEM_");
        // ADMIN: كل صلاحيات القائمة (يُعيَّن في seedSectionPermissions للـ SECTION_*،
        // نضيف هنا MENU_*)
        Role adminRole = roleRepository.findByRoleCode("ADMIN").orElse(null);
        if (adminRole != null) {
            for (String prefix : menuPrefixes) {
                for (Permission perm : permissionRepository.findByPermissionCodeStartingWith(prefix)) {
                    assignPermissionToRole(adminRole, perm.getPermissionCode());
                }
            }
        }
        // GM: كل العناصر
        Role gmRole = roleRepository.findByRoleCode("GM").orElse(null);
        if (gmRole != null) {
            for (String prefix : menuPrefixes) {
                for (Permission perm : permissionRepository.findByPermissionCodeStartingWith(prefix)) {
                    assignPermissionToRole(gmRole, perm.getPermissionCode());
                }
            }
        }
        // أدوار أخرى: حسب القسم (مطابق لـ seedDefaultRoleSectionPermissions)
        java.util.Map<String, java.util.List<String>> roleMenuPrefixes = new java.util.HashMap<>();
        roleMenuPrefixes.put("PM", java.util.Arrays.asList("MENU_MAIN_", "MENU_PROCUREMENT_"));
        roleMenuPrefixes.put("BUYER", java.util.Arrays.asList("MENU_MAIN_", "MENU_PROCUREMENT_"));
        roleMenuPrefixes.put("SM", java.util.Arrays.asList("MENU_MAIN_", "MENU_SALES_", "MENU_CRM_"));
        roleMenuPrefixes.put("WHM", java.util.Arrays.asList("MENU_MAIN_", "MENU_WAREHOUSE_"));
        roleMenuPrefixes.put("QC", java.util.Arrays.asList("MENU_MAIN_", "MENU_OPERATIONS_"));
        roleMenuPrefixes.put("FM", java.util.Arrays.asList("MENU_MAIN_", "MENU_FINANCE_"));
        roleMenuPrefixes.put("ACC", java.util.Arrays.asList("MENU_MAIN_", "MENU_FINANCE_"));
        for (java.util.Map.Entry<String, java.util.List<String>> e : roleMenuPrefixes.entrySet()) {
            Role role = roleRepository.findByRoleCode(e.getKey()).orElse(null);
            if (role == null)
                continue;
            for (String prefix : e.getValue()) {
                for (Permission perm : permissionRepository.findByPermissionCodeStartingWith(prefix)) {
                    assignPermissionToRole(role, perm.getPermissionCode());
                }
            }
        }
        // WHM also needs quality inspection/parameters from MENU_OPERATIONS_ (warehouse-centric)
        Role whmRole = roleRepository.findByRoleCode("WHM").orElse(null);
        if (whmRole != null) {
            assignPermissionToRole(whmRole, "MENU_WAREHOUSE_QUALITY_INSPECTION");
            assignPermissionToRole(whmRole, "MENU_WAREHOUSE_QUALITY_PARAMETERS");
            assignPermissionToRole(whmRole, "MENU_PROCUREMENT_GRN");
        }
    }

    /**
     * صلاحيات الأفعال (Action-level): محاسبة، مستخدمين — تُنشأ وتُعيَّن للأدوار
     * المناسبة
     * حتى يعمل Backend بـ hasAuthority فقط (بدون hasAnyRole).
     */
    private void seedActionPermissions() {
        log.info("Seeding action-level permissions...");

        String[][] actionPerms = {
                { "ACCOUNTING_VIEW", "عرض القيود المحاسبية", "View Journal Entries", "ACCOUNTING" },
                { "ACCOUNTING_CREATE", "إنشاء قيد محاسبي", "Create Journal Entry", "ACCOUNTING" },
                { "ACCOUNTING_UPDATE", "تعديل قيد محاسبي", "Update Journal Entry", "ACCOUNTING" },
                { "ACCOUNTING_DELETE", "حذف قيد محاسبي", "Delete Journal Entry", "ACCOUNTING" },
                { "ACCOUNTING_POST", "ترحيل قيد محاسبي", "Post Journal Entry", "ACCOUNTING" },
                { "SUPPLIER_INVOICE_CREATE", "إنشاء فاتورة مورد", "Create Supplier Invoice", "SUPPLIER_INVOICE" },
                { "SUPPLIER_INVOICE_VIEW", "عرض فواتير الموردين", "View Supplier Invoices", "SUPPLIER_INVOICE" },
                { "SUPPLIER_INVOICE_REVIEW", "مراجعة/مطابقة فاتورة", "Review/Match Supplier Invoice",
                        "SUPPLIER_INVOICE" },
                { "SUPPLIER_INVOICE_APPROVE", "اعتماد صرف فاتورة", "Approve Supplier Invoice Payment",
                        "SUPPLIER_INVOICE" },
                { "SUPPLIER_INVOICE_PAY", "دفع فاتورة (سند صرف)", "Pay Supplier Invoice", "SUPPLIER_INVOICE" },
        };

        for (String[] p : actionPerms) {
            if (permissionRepository.findByPermissionCode(p[0]).isEmpty()) {
                permissionRepository.save(Permission.builder()
                        .permissionCode(p[0])
                        .permissionNameAr(p[1])
                        .permissionNameEn(p[2])
                        .moduleName(p[3])
                        .isActive(true)
                        .build());
                log.info("Created action permission: {}", p[0]);
            }
        }

        List<String> accountingPerms = java.util.Arrays.asList(
                "ACCOUNTING_VIEW", "ACCOUNTING_CREATE", "ACCOUNTING_UPDATE",
                "ACCOUNTING_DELETE", "ACCOUNTING_POST");

        for (String roleCode : java.util.Arrays.asList("ADMIN", "GM", "FM", "ACC")) {
            Role role = roleRepository.findByRoleCode(roleCode).orElse(null);
            if (role == null)
                continue;
            for (String permCode : accountingPerms) {
                assignPermissionToRole(role, permCode);
            }
        }

        // فواتير الموردين — PM/BUYER: إنشاء وعرض؛ FM/ACC: عرض ومراجعة واعتماد ودفع؛
        // ADMIN/GM: الكل
        List<String> supplierInvoicePerms = java.util.Arrays.asList(
                "SUPPLIER_INVOICE_CREATE", "SUPPLIER_INVOICE_VIEW", "SUPPLIER_INVOICE_REVIEW",
                "SUPPLIER_INVOICE_APPROVE", "SUPPLIER_INVOICE_PAY");
        for (String roleCode : java.util.Arrays.asList("PM", "BUYER")) {
            Role role = roleRepository.findByRoleCode(roleCode).orElse(null);
            if (role == null)
                continue;
            for (String permCode : java.util.Arrays.asList("SUPPLIER_INVOICE_CREATE", "SUPPLIER_INVOICE_VIEW")) {
                assignPermissionToRole(role, permCode);
            }
        }
        for (String roleCode : java.util.Arrays.asList("FM", "ACC")) {
            Role role = roleRepository.findByRoleCode(roleCode).orElse(null);
            if (role == null)
                continue;
            for (String permCode : java.util.Arrays.asList("SUPPLIER_INVOICE_VIEW", "SUPPLIER_INVOICE_REVIEW",
                    "SUPPLIER_INVOICE_APPROVE", "SUPPLIER_INVOICE_PAY")) {
                assignPermissionToRole(role, permCode);
            }
        }
        for (String roleCode : java.util.Arrays.asList("ADMIN", "GM")) {
            Role role = roleRepository.findByRoleCode(roleCode).orElse(null);
            if (role == null)
                continue;
            for (String permCode : supplierInvoicePerms) {
                assignPermissionToRole(role, permCode);
            }
        }
    }

    private void assignPermissionToRole(Role role, String permCode) {
        Permission perm = permissionRepository.findByPermissionCode(permCode).orElse(null);
        if (perm == null)
            return;
        boolean exists = rolePermissionRepository.findByRoleRoleId(role.getRoleId()).stream()
                .anyMatch(rp -> rp.getPermission().getPermissionId().equals(perm.getPermissionId()));
        if (!exists) {
            rolePermissionRepository.save(RolePermission.builder()
                    .role(role)
                    .permission(perm)
                    .isAllowed(true)
                    .build());
            log.info("Assigned {} to {}", permCode, role.getRoleCode());
        }
    }

    /**
     * Seed path_permission rules for API endpoints that require dynamic permission
     * checks.
     * These rules tell PathPermissionFilter which permission is needed for each API
     * path.
     */
    private void seedPathPermissions() {
        log.info("Seeding path permission rules...");

        // Database settings endpoints — require SECTION_SYSTEM
        String[][] rules = {
                { "/api/settings/database/**", "*", "SECTION_SYSTEM", "10" },
        };

        for (String[] rule : rules) {
            String pathPattern = rule[0];
            String httpMethod = rule[1];
            String permCode = rule[2];
            int priority = Integer.parseInt(rule[3]);

            // Check if rule already exists
            boolean exists = pathPermissionRepository.findAllByOrderByPriorityDesc().stream()
                    .anyMatch(r -> r.getPathPattern().equals(pathPattern)
                            && r.getHttpMethod().equals(httpMethod)
                            && r.getPathType() == PathType.API);
            if (exists)
                continue;

            Permission perm = permissionRepository.findByPermissionCode(permCode).orElse(null);
            if (perm == null) {
                log.warn("Permission {} not found, skipping path rule for {}", permCode, pathPattern);
                continue;
            }

            pathPermissionRepository.save(PathPermission.builder()
                    .pathPattern(pathPattern)
                    .httpMethod(httpMethod)
                    .permission(perm)
                    .priority(priority)
                    .pathType(PathType.API)
                    .build());
            log.info("Created path permission: {} {} -> {}", httpMethod, pathPattern, permCode);
        }

        // Reload cache so the filter picks up new rules immediately
        pathPermissionService.reloadCache();
    }

    private void seedApprovalWorkflows() {
        log.info("Seeding approval workflows...");

        // 1. PR Approval Workflow
        if (!workflowRepo.findByWorkflowCode("PR_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow prWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("PR_APPROVAL")
                    .workflowName("Purchase Requisition Approval")
                    .documentType("PurchaseRequisition")
                    .isActive(true)
                    .build();
            workflowRepo.save(prWorkflow);

            Role pmRole = roleRepository.findByRoleCode("PM").orElse(null);
            if (pmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(prWorkflow)
                        .stepNumber(1)
                        .stepName("Procurement Manager Approval")
                        .approverType("ROLE")
                        .approverRole(pmRole)
                        .build();
                stepRepo.save(step1);
            }
        }

        // 2. PO Approval Workflow
        if (!workflowRepo.findByWorkflowCode("PO_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow poWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("PO_APPROVAL")
                    .workflowName("Purchase Order Approval")
                    .documentType("PurchaseOrder")
                    .isActive(true)
                    .build();
            workflowRepo.save(poWorkflow);

            // Multi-step workflow: PM -> FM -> GM (will be filtered حسب حدود المبلغ)
            Role pmRole = roleRepository.findByRoleCode("PM").orElse(null);
            Role fmRole = roleRepository.findByRoleCode("FM").orElse(null);
            Role gmRole = roleRepository.findByRoleCode("GM").orElse(null);

            int stepNumber = 1;
            if (pmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(poWorkflow)
                        .stepNumber(stepNumber++)
                        .stepName("Procurement Manager Approval")
                        .approverType("ROLE")
                        .approverRole(pmRole)
                        .build();
                stepRepo.save(step1);
            }
            if (fmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step2 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(poWorkflow)
                        .stepNumber(stepNumber++)
                        .stepName("Finance Manager Approval")
                        .approverType("ROLE")
                        .approverRole(fmRole)
                        .build();
                stepRepo.save(step2);
            }
            if (gmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step3 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(poWorkflow)
                        .stepNumber(stepNumber)
                        .stepName("General Manager Approval")
                        .approverType("ROLE")
                        .approverRole(gmRole)
                        .build();
                stepRepo.save(step3);
            }
        }

        // 3. Supplier Approval Workflow
        if (!workflowRepo.findByWorkflowCode("SUPPLIER_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow supWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("SUPPLIER_APPROVAL")
                    .workflowName("Supplier Approval")
                    .documentType("Supplier")
                    .isActive(true)
                    .build();
            workflowRepo.save(supWorkflow);

            Role gmRole = roleRepository.findByRoleCode("GM").orElse(null);
            if (gmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(supWorkflow)
                        .stepNumber(1)
                        .stepName("General Manager Approval")
                        .approverType("ROLE")
                        .approverRole(gmRole)
                        .build();
                stepRepo.save(step1);
            }
        }

        // 4. GRN Approval Workflow (Quality Check -> Procurement)
        if (!workflowRepo.findByWorkflowCode("GRN_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow grnWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("GRN_APPROVAL")
                    .workflowName("Goods Receipt Note Approval")
                    .documentType("GoodsReceiptNote")
                    .isActive(true)
                    .build();
            workflowRepo.save(grnWorkflow);

            // Step 1: Quality Controller Approval
            Role qcRole = roleRepository.findByRoleCode("QC").orElse(null);
            if (qcRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(grnWorkflow)
                        .stepNumber(1)
                        .stepName("Quality Controller Approval")
                        .approverType("ROLE")
                        .approverRole(qcRole)
                        .build();
                stepRepo.save(step1);
            }

            // Step 2: Warehouse Manager Approval
            Role whmRole = roleRepository.findByRoleCode("WHM").orElse(null);
            if (whmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step2 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(grnWorkflow)
                        .stepNumber(2)
                        .stepName("Warehouse Manager Approval")
                        .approverType("ROLE")
                        .approverRole(whmRole)
                        .build();
                stepRepo.save(step2);
            }
        }

        // 5. Purchase Return Approval Workflow (Quality Controller)
        if (!workflowRepo.findByWorkflowCode("RET_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow retWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("RET_APPROVAL")
                    .workflowName("Purchase Return Approval")
                    .documentType("PurchaseReturn")
                    .isActive(true)
                    .build();
            workflowRepo.save(retWorkflow);

            // Quality Controller approves purchase returns (usually quality-related)
            Role qcRole = roleRepository.findByRoleCode("QC").orElse(null);
            if (qcRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(retWorkflow)
                        .stepNumber(1)
                        .stepName("Quality Controller Approval")
                        .approverType("ROLE")
                        .approverRole(qcRole)
                        .build();
                stepRepo.save(step1);
            }
        }

        // 6. QC Approval Workflow
        if (!workflowRepo.findByWorkflowCode("QC_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow qcWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("QC_APPROVAL")
                    .workflowName("Quotation Comparison Approval")
                    .documentType("QuotationComparison")
                    .isActive(true)
                    .build();
            workflowRepo.save(qcWorkflow);

            Role pmRole = roleRepository.findByRoleCode("PM").orElse(null);
            Role fmRole = roleRepository.findByRoleCode("FM").orElse(null);
            Role gmRole = roleRepository.findByRoleCode("GM").orElse(null);

            // ✅ Step 1: Procurement Manager Approval
            if (pmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(qcWorkflow)
                        .stepNumber(1)
                        .stepName("Procurement Manager Approval")
                        .approverType("ROLE")
                        .approverRole(pmRole)
                        .build();
                stepRepo.save(step1);
            }

            // ✅ Step 2: Finance Manager Approval (NEW)
            if (fmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step2 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(qcWorkflow)
                        .stepNumber(2)
                        .stepName("Finance Manager Approval")
                        .approverType("ROLE")
                        .approverRole(fmRole)
                        .build();
                stepRepo.save(step2);
            }

            // ✅ Step 3: General Manager Approval (NEW)
            if (gmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step3 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(qcWorkflow)
                        .stepNumber(3)
                        .stepName("General Manager Approval")
                        .approverType("ROLE")
                        .approverRole(gmRole)
                        .build();
                stepRepo.save(step3);
            }
        }
        // 7. Payment Voucher Approval Workflow
        if (!workflowRepo.findByWorkflowCode("PV_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow pvWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("PV_APPROVAL")
                    .workflowName("Payment Voucher Approval")
                    .documentType("PaymentVoucher")
                    .isActive(true)
                    .build();
            workflowRepo.save(pvWorkflow);

            Role fmRole = roleRepository.findByRoleCode("FM").orElse(null);
            Role gmRole = roleRepository.findByRoleCode("GM").orElse(null);

            if (fmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(pvWorkflow)
                        .stepNumber(1)
                        .stepName("Finance Manager Approval")
                        .approverType("ROLE")
                        .approverRole(fmRole)
                        .build();
                stepRepo.save(step1);
            }

            if (gmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step2 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(pvWorkflow)
                        .stepNumber(2)
                        .stepName("General Manager Approval")
                        .approverType("ROLE")
                        .approverRole(gmRole)
                        .build();
                stepRepo.save(step2);
            }

            Role accRole = roleRepository.findByRoleCode("ACC").orElse(null);
            if (accRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step3 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(pvWorkflow)
                        .stepNumber(3)
                        .stepName("Payment Disbursement")
                        .approverType("ROLE")
                        .approverRole(accRole)
                        .build();
                stepRepo.save(step3);
            }
        }

        // 8. Delivery Order Approval Workflow
        if (!workflowRepo.findByWorkflowCode("DELIVERY_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow doWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("DELIVERY_APPROVAL")
                    .workflowName("Delivery Order Approval")
                    .documentType("DeliveryOrder")
                    .isActive(true)
                    .build();
            workflowRepo.save(doWorkflow);

            Role gmRole = roleRepository.findByRoleCode("GM").orElse(null);
            if (gmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(doWorkflow)
                        .stepNumber(1)
                        .stepName("General Manager Approval")
                        .approverType("ROLE")
                        .approverRole(gmRole)
                        .build();
                stepRepo.save(step1);
            }
        }

        // 9. Sales Quotation Approval
        if (!workflowRepo.findByWorkflowCode("QUOTATION_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow workflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("QUOTATION_APPROVAL")
                    .workflowName("Sales Quotation Approval")
                    .documentType("SalesQuotation")
                    .isActive(true)
                    .build();
            workflowRepo.save(workflow);

            Role smRole = roleRepository.findByRoleCode("SM").orElse(null);
            if (smRole != null) {
                stepRepo.save(com.rasras.erp.approval.ApprovalWorkflowStep.builder()
                        .workflow(workflow).stepNumber(1).stepName("Sales Manager Approval")
                        .approverType("ROLE").approverRole(smRole).build());
            }
        }

        // 10. Sales Order Approval
        if (!workflowRepo.findByWorkflowCode("SO_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow workflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("SO_APPROVAL")
                    .workflowName("Sales Order Approval")
                    .documentType("SalesOrder")
                    .isActive(true)
                    .build();
            workflowRepo.save(workflow);

            Role smRole = roleRepository.findByRoleCode("SM").orElse(null);
            if (smRole != null) {
                stepRepo.save(com.rasras.erp.approval.ApprovalWorkflowStep.builder()
                        .workflow(workflow).stepNumber(1).stepName("Sales Manager Approval")
                        .approverType("ROLE").approverRole(smRole).build());
            }
        }

        // 11. Stock Issue Note Approval
        if (!workflowRepo.findByWorkflowCode("ISSUE_NOTE_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow workflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("ISSUE_NOTE_APPROVAL")
                    .workflowName("Stock Issue Note Approval")
                    .documentType("StockIssueNote")
                    .isActive(true)
                    .build();
            workflowRepo.save(workflow);

            Role whmRole = roleRepository.findByRoleCode("WHM").orElse(null);
            if (whmRole != null) {
                stepRepo.save(com.rasras.erp.approval.ApprovalWorkflowStep.builder()
                        .workflow(workflow).stepNumber(1).stepName("Warehouse Manager Approval")
                        .approverType("ROLE").approverRole(whmRole).build());
            }
        }

        // 12. Sales Invoice Approval
        if (!workflowRepo.findByWorkflowCode("INVOICE_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow workflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("INVOICE_APPROVAL")
                    .workflowName("Sales Invoice Approval")
                    .documentType("SalesInvoice")
                    .isActive(true)
                    .build();
            workflowRepo.save(workflow);

            Role fmRole = roleRepository.findByRoleCode("FM").orElse(null);
            if (fmRole != null) {
                stepRepo.save(com.rasras.erp.approval.ApprovalWorkflowStep.builder()
                        .workflow(workflow).stepNumber(1).stepName("Finance Manager Approval")
                        .approverType("ROLE").approverRole(fmRole).build());
            }
        }

        // 13. Payment Receipt Approval
        if (!workflowRepo.findByWorkflowCode("RECEIPT_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow workflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("RECEIPT_APPROVAL")
                    .workflowName("Payment Receipt Approval")
                    .documentType("PaymentReceipt")
                    .isActive(true)
                    .build();
            workflowRepo.save(workflow);

            Role fmRole = roleRepository.findByRoleCode("FM").orElse(null);
            if (fmRole != null) {
                stepRepo.save(com.rasras.erp.approval.ApprovalWorkflowStep.builder()
                        .workflow(workflow).stepNumber(1).stepName("Finance Manager Approval")
                        .approverType("ROLE").approverRole(fmRole).build());
            }
        }
    }

    /**
     * Seed approval limits (ApprovalLimit) for main activities:
     * - PO_APPROVAL: حدود الموافقة على أوامر الشراء
     * - PAYMENT_APPROVAL: حدود اعتماد صرف فواتير الموردين / الشيكات
     * - SALES_DISCOUNT: حدود خصم المبيعات (للاستخدام المستقبلي)
     */
    private void seedApprovalLimits() {
        log.info("Seeding approval limits...");

        // Helper to get role by code safely
        java.util.function.Function<String, Role> getRole = code -> roleRepository.findByRoleCode(code).orElse(null);

        // 1) حدود أوامر الشراء (PO_APPROVAL)
        if (limitRepo.findByActivityTypeAndIsActiveTrue("PO_APPROVAL").isEmpty()) {
            Role pm = getRole.apply("PM"); // Procurement Manager
            Role fm = getRole.apply("FM"); // Finance Manager
            Role gm = getRole.apply("GM"); // General Manager

            if (pm != null) {
                com.rasras.erp.approval.ApprovalLimit limitPm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("PO_APPROVAL")
                        .role(pm)
                        .minAmount(java.math.BigDecimal.ZERO)
                        .maxAmount(new java.math.BigDecimal("20000"))
                        .isActive(true)
                        .build();
                limitRepo.save(limitPm);
            }

            if (fm != null) {
                com.rasras.erp.approval.ApprovalLimit limitFm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("PO_APPROVAL")
                        .role(fm)
                        .minAmount(new java.math.BigDecimal("20000"))
                        .maxAmount(new java.math.BigDecimal("50000"))
                        .isActive(true)
                        .build();
                limitRepo.save(limitFm);
            }

            if (gm != null) {
                com.rasras.erp.approval.ApprovalLimit limitGm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("PO_APPROVAL")
                        .role(gm)
                        .minAmount(new java.math.BigDecimal("50000"))
                        .maxAmount(null) // بلا حد أعلى
                        .isActive(true)
                        .build();
                limitRepo.save(limitGm);
            }
        }

        // 2) حدود اعتماد صرف فواتير الموردين / الشيكات (PAYMENT_APPROVAL)
        if (limitRepo.findByActivityTypeAndIsActiveTrue("PAYMENT_APPROVAL").isEmpty()) {
            Role acc = getRole.apply("ACC"); // Accountant
            Role fm = getRole.apply("FM"); // Finance Manager
            Role gm = getRole.apply("GM"); // General Manager

            if (acc != null) {
                com.rasras.erp.approval.ApprovalLimit limitAcc = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("PAYMENT_APPROVAL")
                        .role(acc)
                        .minAmount(java.math.BigDecimal.ZERO)
                        .maxAmount(new java.math.BigDecimal("30000"))
                        .isActive(true)
                        .build();
                limitRepo.save(limitAcc);
            }

            if (fm != null) {
                com.rasras.erp.approval.ApprovalLimit limitFm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("PAYMENT_APPROVAL")
                        .role(fm)
                        .minAmount(new java.math.BigDecimal("30000"))
                        .maxAmount(new java.math.BigDecimal("100000"))
                        .isActive(true)
                        .build();
                limitRepo.save(limitFm);
            }

            if (gm != null) {
                com.rasras.erp.approval.ApprovalLimit limitGm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("PAYMENT_APPROVAL")
                        .role(gm)
                        .minAmount(new java.math.BigDecimal("100000"))
                        .maxAmount(null)
                        .isActive(true)
                        .build();
                limitRepo.save(limitGm);
            }
        }

        // 3) حدود خصم المبيعات (SALES_DISCOUNT) - للاستخدام المستقبلي
        if (limitRepo.findByActivityTypeAndIsActiveTrue("SALES_DISCOUNT").isEmpty()) {
            Role sm = getRole.apply("SM"); // Sales Manager
            Role fm = getRole.apply("FM"); // Finance Manager
            Role gm = getRole.apply("GM"); // General Manager

            if (sm != null) {
                com.rasras.erp.approval.ApprovalLimit limitSm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("SALES_DISCOUNT")
                        .role(sm)
                        .minPercentage(java.math.BigDecimal.ZERO)
                        .maxPercentage(new java.math.BigDecimal("5"))
                        .isActive(true)
                        .build();
                limitRepo.save(limitSm);
            }

            if (fm != null) {
                com.rasras.erp.approval.ApprovalLimit limitFm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("SALES_DISCOUNT")
                        .role(fm)
                        .minPercentage(new java.math.BigDecimal("5"))
                        .maxPercentage(new java.math.BigDecimal("10"))
                        .isActive(true)
                        .build();
                limitRepo.save(limitFm);
            }

            if (gm != null) {
                com.rasras.erp.approval.ApprovalLimit limitGm = com.rasras.erp.approval.ApprovalLimit.builder()
                        .activityType("SALES_DISCOUNT")
                        .role(gm)
                        .minPercentage(new java.math.BigDecimal("10"))
                        .maxPercentage(null)
                        .isActive(true)
                        .build();
                limitRepo.save(limitGm);
            }
        }
    }
}
