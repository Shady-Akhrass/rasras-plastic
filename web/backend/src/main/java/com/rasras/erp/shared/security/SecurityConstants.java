package com.rasras.erp.shared.security;

/**
 * تعابير الصلاحيات للـ @PreAuthorize — كلها ديناميكية من قاعدة البيانات (جدول rolepermissions).
 * لا توجد أدوار ثابتة في الكود؛ التعيين من صفحة الأدوار والصلاحيات فقط.
 * متوافق مع doc/توثيق_الصلاحيات.md.
 */
public final class SecurityConstants {

    private SecurityConstants() {}

    /** إعدادات النظام والأدوار والصلاحيات — من لديه SECTION_SYSTEM فقط (تُعيّن من صفحة الصلاحيات) */
    public static final String SYSTEM_ADMIN_ONLY = "hasAuthority('SECTION_SYSTEM')";

    /** الاعتمادات (اعتماد/رفض) — من لديه SECTION_MAIN (تُعيّن من صفحة الصلاحيات) */
    public static final String APPROVAL_ACTION = "hasAuthority('SECTION_MAIN')";

    /** قائمة الاعتمادات — أي مستخدم مسجّل (الفلترة حسب المستخدم أو الدور داخل الخدمة) */
    public static final String AUTHENTICATED = "isAuthenticated()";

    /** المشتريات: طلبات شراء، أوامر شراء، GRN، عروض، مقارنات، مرتجعات، موردون (متوافق مع الواجهة — لا SECTION_OPERATIONS) */
    public static final String PROCUREMENT_SECTION =
            "hasAuthority('SECTION_PROCUREMENT') or hasAuthority('SECTION_SALES')";

    /** المبيعات: أوامر، عروض، فواتير، تسليم، إيصالات، طلبات عملاء، صرف مخزني (متوافق مع الواجهة — لا SECTION_OPERATIONS) */
    public static final String SALES_SECTION = "hasAuthority('SECTION_SALES')";

    /** المالية والمحاسبة: سندات صرف، اعتمادات */
    public static final String FINANCE_SECTION = "hasAuthority('SECTION_FINANCE')";

    /** فواتير الموردين: للمشتريات وللمالية (عرض الفواتير غير المدفوعة في سندات الصرف) — للتوافق مع controllers أخرى (لا SECTION_OPERATIONS) */
    public static final String SUPPLIER_INVOICES =
            "hasAuthority('SECTION_PROCUREMENT') or hasAuthority('SECTION_SALES') or hasAuthority('SECTION_FINANCE')";

    /** فواتير الموردين — Action-level (فصل الصلاحيات SoD) */
    public static final String SUPPLIER_INVOICE_CREATE  = "hasAuthority('SUPPLIER_INVOICE_CREATE')";
    public static final String SUPPLIER_INVOICE_VIEW    = "hasAuthority('SUPPLIER_INVOICE_VIEW')";
    public static final String SUPPLIER_INVOICE_REVIEW  = "hasAuthority('SUPPLIER_INVOICE_REVIEW')";
    public static final String SUPPLIER_INVOICE_APPROVE = "hasAuthority('SUPPLIER_INVOICE_APPROVE')";
    public static final String SUPPLIER_INVOICE_PAY     = "hasAuthority('SUPPLIER_INVOICE_PAY')";

    /** قراءة GRN في سياق فاتورة (للمطابقة) — للمنشئ أو للمراجع دون فتح قائمة GRN العامة */
    public static final String SUPPLIER_INVOICE_CREATE_OR_REVIEW =
            "hasAuthority('SUPPLIER_INVOICE_CREATE') or hasAuthority('SUPPLIER_INVOICE_REVIEW')";

    /** العمليات فقط: معاملات الجودة، قوائم الأسعار (متوافق مع الواجهة — قسم العمليات) */
    public static final String OPERATIONS_SECTION = "hasAuthority('SECTION_OPERATIONS')";

    /** المخازن والمستودعات: أصناف، مخازن، وحدات، تصنيفات، أرصدة، تعديلات. INVENTORY_VIEW مُنشأة في DataSeeder ويمكن منحها من لوحة الصلاحيات. */
    public static final String WAREHOUSE_SECTION =
            "hasAuthority('SECTION_WAREHOUSE') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('SECTION_PROCUREMENT') or hasAuthority('INVENTORY_VIEW')";

    /** تصنيفات الأصناف: من لديه قسم مخازن/عمليات أو صلاحية عنصر القائمة فقط (كما في الأدوار والصلاحيات تحت «العمليات») */
    public static final String INVENTORY_CATEGORIES_ACCESS =
            "(" + WAREHOUSE_SECTION + ") or hasAuthority('MENU_OPERATIONS_CATEGORIES')";

    /** الأصناف: من لديه قسم مخازن/عمليات أو SUPPLIER_INVOICE_VIEW أو صلاحية عنصر القائمة فقط */
    public static final String INVENTORY_ITEMS_ACCESS =
            "(" + WAREHOUSE_SECTION + ") or hasAuthority('SUPPLIER_INVOICE_VIEW') or hasAuthority('MENU_OPERATIONS_ITEMS')";

    /** قوائم الأسعار: من لديه قسم العمليات أو صلاحية عنصر القائمة فقط */
    public static final String PRICE_LISTS_ACCESS =
            "hasAuthority('SECTION_OPERATIONS') or hasAuthority('MENU_OPERATIONS_PRICE_LISTS')";

    /** معاملات الجودة: من لديه قسم العمليات أو صلاحية عنصر القائمة فقط */
    public static final String QUALITY_PARAMETERS_ACCESS =
            "hasAuthority('SECTION_OPERATIONS') or hasAuthority('MENU_OPERATIONS_QUALITY_PARAMETERS')";

    /** أرصدة المخزون: من لديه قسم مخازن/عمليات أو صلاحية الأصناف (صفحة الأصناف تحتاج الأرصدة مع القائمة) */
    public static final String STOCKS_ACCESS =
            "(" + WAREHOUSE_SECTION + ") or hasAuthority('MENU_OPERATIONS_ITEMS')";

    /** العملاء (CRM) */
    public static final String CRM_SECTION =
            "hasAuthority('SECTION_CRM') or hasAuthority('SECTION_SALES')";

    /** الموظفين والـ HR — من لديه SECTION_EMPLOYEES */
    public static final String EMPLOYEES_SECTION = "hasAuthority('SECTION_EMPLOYEES')";

    /** إدارة المستخدمين — من لديه SECTION_USERS (تُعيّن من صفحة الصلاحيات) */
    public static final String USER_MANAGEMENT = "hasAuthority('SECTION_USERS')";
}
