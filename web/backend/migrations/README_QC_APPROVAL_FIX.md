# ⚠️ ملف قديم - راجع الحل الشامل

> **ملاحظة**: هذا الملف قديم ويتعلق بـ QC_APPROVAL فقط.  
> **الحل الشامل** (PO + QC + جميع workflows): راجع `WORKFLOW_MANAGEMENT_APPROVAL_FIX.md`

---

# حذف خطوة Management Approval الزائدة من QC_APPROVAL Workflow

## المشكلة
كان هناك خطوة رابعة زائدة باسم "Management Approval" في سير اعتماد طلب المقارنة (QC_APPROVAL).

الخطوات الصحيحة يجب أن تكون **3 فقط**:
1. **Procurement Manager Approval** (مدير المشتريات)
2. **Finance Manager Approval** (المدير المالي)
3. **General Manager Approval** (المدير العام)

## الحل
تم إنشاء migration script لحذف الخطوة الزائدة:
- **ملف الـ Migration**: `remove_extra_management_approval_qc.sql`
- **ملف التحليل**: `analyze_qc_approval_steps.sql` (للتحليل فقط)

## التحقق من الكود

### ✅ الكود الصحيح (DataSeeder.java)
الملف: `web/backend/src/main/java/com/rasras/erp/user/DataSeeder.java` (Lines 393-445)

```java
// 6. QC Approval Workflow
if (!workflowRepo.findByWorkflowCode("QC_APPROVAL").isPresent()) {
    ApprovalWorkflow qcWorkflow = ApprovalWorkflow.builder()
            .workflowCode("QC_APPROVAL")
            .workflowName("Quotation Comparison Approval")
            .documentType("QuotationComparison")
            .isActive(true)
            .build();
    workflowRepo.save(qcWorkflow);

    // Step 1: Procurement Manager Approval
    // Step 2: Finance Manager Approval
    // Step 3: General Manager Approval
}
```

**النتيجة**: الكود صحيح ويحدد 3 خطوات فقط. ✅

### ✅ ملفات أخرى تم التحقق منها

1. **WorkflowDataSeeder.java**
   - يتعامل مع `PO_APPROVAL` فقط (وليس QC_APPROVAL)
   - لا يؤثر على QC_APPROVAL workflow ✅

2. **setup_qc_approval.sql** (ملف قديم في `doc/migrations/`)
   - ملف قديم يحتوي على خطوتين فقط
   - لم يعد مستخدماً
   - تم استبداله بـ `apply_qc_approval_workflow.sql` الذي يحدد 3 خطوات صحيحة

## مصدر المشكلة المحتمل
الخطوة الزائدة "Management Approval" قد تكون أُضيفت:
1. يدوياً عبر قاعدة البيانات
2. من خلال migration قديم تم تشغيله سابقاً
3. من خلال واجهة إدارية في النظام

## خطوات التنفيذ

### 1. التحليل (اختياري)
```bash
mysql -u username -p database_name < analyze_qc_approval_steps.sql
```

### 2. تنفيذ Migration
```bash
mysql -u username -p database_name < remove_extra_management_approval_qc.sql
```

### 3. التحقق بعد التنفيذ
```sql
SELECT 
    aws.StepNumber,
    aws.StepName,
    r.RoleCode,
    r.RoleNameAr
FROM approvalworkflowsteps aws
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aws.WorkflowID = (
    SELECT WorkflowID 
    FROM approvalworkflows 
    WHERE WorkflowCode = 'QC_APPROVAL'
)
ORDER BY aws.StepNumber;
```

**النتيجة المتوقعة**:
| StepNumber | StepName | RoleCode | RoleNameAr |
|------------|----------|----------|-------------|
| 1 | Procurement Manager Approval | PM | مدير المشتريات |
| 2 | Finance Manager Approval | FM | المدير المالي |
| 3 | General Manager Approval | GM | المدير العام |

## ملاحظات مهمة

### ✅ آمن لإعادة التنفيذ
الـ migration script مصمم بحيث يكون idempotent - يمكن تشغيله أكثر من مرة بأمان.

### ⚠️ backup قبل التنفيذ
يُنصح بعمل backup لقاعدة البيانات قبل تنفيذ أي migration:
```bash
mysqldump -u username -p database_name > backup_before_qc_fix.sql
```

### ✅ معالجة الطلبات المعلقة
الـ migration يتعامل تلقائياً مع أي approval requests معلقة كانت تشير للخطوة المحذوفة:
- يعيدها للخطوة الأولى (Procurement Manager)
- يحدث حالتها إلى "Pending"

## الملفات المتأثرة

### ملفات تم إنشاؤها
- ✅ `web/backend/migrations/analyze_qc_approval_steps.sql` - للتحليل
- ✅ `web/backend/migrations/remove_extra_management_approval_qc.sql` - للتنفيذ
- ✅ `web/backend/migrations/README_QC_APPROVAL_FIX.md` - هذا الملف

### ملفات تم التحقق منها (لا تحتاج تعديل)
- ✅ `web/backend/src/main/java/com/rasras/erp/user/DataSeeder.java` - صحيح
- ✅ `web/backend/src/main/java/com/rasras/erp/bootstrap/WorkflowDataSeeder.java` - لا يؤثر
- ✅ `web/backend/migrations/apply_qc_approval_workflow.sql` - صحيح (3 خطوات)

## الاختبار بعد التطبيق

1. **اختبار إنشاء مقارنة جديدة**
   - إنشاء quotation comparison جديد
   - إرساله للاعتماد
   - التأكد من ظهور 3 خطوات فقط

2. **اختبار سير الاعتماد**
   - اعتماد من PM → يجب الانتقال لـ FM
   - اعتماد من FM → يجب الانتقال لـ GM
   - اعتماد من GM → يجب إنشاء PO تلقائياً

3. **اختبار الرفض**
   - رفض من أي خطوة → يجب العودة لـ Draft
   - يمكن إعادة الإرسال

## الدعم
إذا واجهت أي مشاكل:
1. تحقق من logs قاعدة البيانات
2. راجع ملف التحليل `analyze_qc_approval_steps.sql`
3. تأكد من أن الـ migration تم تنفيذه بنجاح

---
**تاريخ الإنشاء**: 2026-02-14  
**الإصدار**: 1.0
