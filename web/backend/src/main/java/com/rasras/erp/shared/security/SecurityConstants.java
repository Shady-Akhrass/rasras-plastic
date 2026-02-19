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

    /** المشتريات: طلبات شراء، أوامر شراء، GRN، عروض، مقارنات، مرتجعات، موردون */
    public static final String PROCUREMENT_SECTION =
            "hasAuthority('SECTION_PROCUREMENT') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('SECTION_SALES')";

    /** المبيعات: أوامر، عروض، فواتير، تسليم، إيصالات، طلبات عملاء، صرف مخزني */
    public static final String SALES_SECTION =
            "hasAuthority('SECTION_SALES') or hasAuthority('SECTION_OPERATIONS')";

    /** المالية والمحاسبة: سندات صرف، اعتمادات */
    public static final String FINANCE_SECTION = "hasAuthority('SECTION_FINANCE')";

    /** فواتير الموردين: للمشتريات وللمالية (عرض الفواتير غير المدفوعة في سندات الصرف) */
    public static final String SUPPLIER_INVOICES =
            "hasAuthority('SECTION_PROCUREMENT') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('SECTION_SALES') or hasAuthority('SECTION_FINANCE')";

    /** المخازن والمستودعات: أصناف، مخازن، وحدات، تصنيفات، أرصدة، تعديلات، جودة، قوائم أسعار */
    public static final String WAREHOUSE_SECTION =
            "hasAuthority('SECTION_WAREHOUSE') or hasAuthority('SECTION_OPERATIONS') or hasAuthority('SECTION_PROCUREMENT') or hasAuthority('INVENTORY_VIEW')";

    /** العملاء (CRM) */
    public static final String CRM_SECTION =
            "hasAuthority('SECTION_CRM') or hasAuthority('SECTION_SALES')";

    /** الموظفين والـ HR — من لديه SECTION_EMPLOYEES */
    public static final String EMPLOYEES_SECTION = "hasAuthority('SECTION_EMPLOYEES')";
}
