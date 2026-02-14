# خطة اختبار سير اعتماد طلب المقارنة (QC_APPROVAL)

## الهدف
التأكد من أن سير اعتماد طلب المقارنة يعمل بشكل صحيح بعد حذف خطوة "Management Approval" الزائدة.

---

## المتطلبات الأولية

### 1. تنفيذ Migration
```bash
mysql -u username -p database_name < remove_extra_management_approval_qc.sql
```

### 2. التأكد من الأدوار (Roles)
يجب أن تكون الأدوار التالية موجودة ومخصصة لمستخدمين:
- **PM** (Procurement Manager - مدير المشتريات)
- **FM** (Finance Manager - المدير المالي)
- **GM** (General Manager - المدير العام)

### 3. إعادة تشغيل التطبيق
```bash
# من مجلد backend
./mvnw spring-boot:run
# أو
java -jar target/rasras-erp.jar
```

---

## سيناريوهات الاختبار

### السيناريو 1: التحقق من عدد الخطوات ✅

**الهدف**: التأكد من أن الخطوات أصبحت 3 فقط

#### الخطوات:
1. افتح قاعدة البيانات
2. نفذ الاستعلام التالي:
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

#### النتيجة المتوقعة:
| StepNumber | StepName | RoleCode | RoleNameAr |
|------------|----------|----------|-------------|
| 1 | Procurement Manager Approval | PM | مدير المشتريات |
| 2 | Finance Manager Approval | FM | المدير المالي |
| 3 | General Manager Approval | GM | المدير العام |

**عدد الصفوف**: 3 فقط ✅

#### معايير النجاح:
- ✅ عدد الخطوات = 3
- ✅ لا توجد خطوة باسم "Management Approval" (منفصلة عن General Manager Approval)
- ✅ الترتيب صحيح: PM → FM → GM

---

### السيناريو 2: إنشاء مقارنة عروض جديدة ✅

**الهدف**: التأكد من إمكانية إنشاء مقارنة جديدة

#### الخطوات:
1. سجل دخول كمستخدم عادي (أو PM)
2. انتقل إلى صفحة Quotation Comparison
3. أنشئ مقارنة جديدة:
   - اختر Purchase Request
   - أضف عروض أسعار (quotations)
   - اختر عرض فائز (Selected Quotation)
4. احفظ المقارنة (حالة: Draft)

#### النتيجة المتوقعة:
- ✅ تم إنشاء المقارنة بنجاح
- ✅ الحالة: Draft
- ✅ ApprovalStatus: NULL أو فارغ

#### معايير النجاح:
- لا أخطاء في console أو logs
- المقارنة ظاهرة في قائمة المقارنات

---

### السيناريو 3: إرسال المقارنة للاعتماد ✅

**الهدف**: التأكد من إنشاء approval request بـ 3 خطوات فقط

#### الخطوات:
1. افتح المقارنة التي أنشأتها في السيناريو 2
2. تأكد من اختيار عرض فائز (Selected Quotation)
3. اضغط "Submit for Approval" أو "إرسال للاعتماد"

#### النتيجة المتوقعة:
**في قاعدة البيانات**:
```sql
-- التحقق من approval request
SELECT 
    ar.RequestID,
    ar.DocumentNumber,
    ar.Status,
    ar.CurrentStepID,
    aws.StepNumber,
    aws.StepName
FROM approvalrequests ar
LEFT JOIN approvalworkflowsteps aws ON ar.CurrentStepID = aws.StepID
WHERE ar.DocumentType = 'QuotationComparison'
ORDER BY ar.RequestedDate DESC
LIMIT 1;
```

**النتيجة**:
- ✅ Status: Pending
- ✅ CurrentStepID: يشير لخطوة رقم 1 (PM)
- ✅ StepName: "Procurement Manager Approval"

**في واجهة المستخدم**:
- ✅ حالة المقارنة تغيرت إلى "Pending Approval" أو "PendingApproval"
- ✅ يظهر اسم الخطوة الحالية: "Procurement Manager Approval"

#### معايير النجاح:
- لا أخطاء أثناء الإرسال
- تم إنشاء approval request
- CurrentStep = الخطوة الأولى (PM)

---

### السيناريو 4: اعتماد من مدير المشتريات (PM) ✅

**الهدف**: التأكد من الانتقال للخطوة الثانية (FM)

#### الخطوات:
1. سجل دخول كمستخدم بدور **PM** (Procurement Manager)
2. انتقل إلى صفحة Pending Approvals أو Approval Requests
3. ابحث عن طلب المقارنة الذي أرسلته
4. اضغط "Approve" أو "اعتماد"

#### النتيجة المتوقعة:
```sql
-- التحقق من الخطوة الحالية
SELECT 
    ar.RequestID,
    ar.Status,
    aws.StepNumber,
    aws.StepName
FROM approvalrequests ar
LEFT JOIN approvalworkflowsteps aws ON ar.CurrentStepID = aws.StepID
WHERE ar.DocumentType = 'QuotationComparison'
  AND ar.DocumentID = <comparison_id>
ORDER BY ar.RequestedDate DESC
LIMIT 1;
```

**النتيجة**:
- ✅ Status: لا يزال Pending (لم ينته السير بعد)
- ✅ CurrentStepID: يشير لخطوة رقم 2 (FM)
- ✅ StepName: "Finance Manager Approval"

**في الواجهة**:
- ✅ الخطوة الحالية: "Finance Manager Approval"
- ✅ لا تظهر المقارنة في قائمة PM anymore
- ✅ تظهر في قائمة انتظار FM

#### معايير النجاح:
- الطلب انتقل للخطوة الثانية (FM)
- لم ينتقل لخطوة "Management Approval" زائدة

---

### السيناريو 5: اعتماد من المدير المالي (FM) ✅

**الهدف**: التأكد من الانتقال للخطوة الثالثة (GM)

#### الخطوات:
1. سجل دخول كمستخدم بدور **FM** (Finance Manager)
2. انتقل إلى صفحة Pending Approvals
3. ابحث عن طلب المقارنة
4. اضغط "Approve"

#### النتيجة المتوقعة:
```sql
SELECT 
    ar.Status,
    aws.StepNumber,
    aws.StepName
FROM approvalrequests ar
LEFT JOIN approvalworkflowsteps aws ON ar.CurrentStepID = aws.StepID
WHERE ar.DocumentType = 'QuotationComparison'
  AND ar.DocumentID = <comparison_id>;
```

**النتيجة**:
- ✅ Status: لا يزال Pending
- ✅ CurrentStepID: يشير لخطوة رقم 3 (GM)
- ✅ StepName: "General Manager Approval"

**في الواجهة**:
- ✅ الخطوة الحالية: "General Manager Approval"
- ✅ تظهر في قائمة انتظار GM

#### معايير النجاح:
- الطلب انتقل للخطوة الثالثة (GM)
- لا توجد خطوات إضافية بعد GM

---

### السيناريو 6: الاعتماد النهائي من المدير العام (GM) ✅

**الهدف**: التأكد من اكتمال السير وإنشاء PO تلقائياً

#### الخطوات:
1. سجل دخول كمستخدم بدور **GM** (General Manager)
2. انتقل إلى صفحة Pending Approvals
3. ابحث عن طلب المقارنة
4. اضغط "Approve"

#### النتيجة المتوقعة:

**في approvalrequests**:
```sql
SELECT 
    ar.RequestID,
    ar.Status,
    ar.CurrentStepID,
    ar.ApprovedDate
FROM approvalrequests ar
WHERE ar.DocumentType = 'QuotationComparison'
  AND ar.DocumentID = <comparison_id>;
```
- ✅ Status: "Approved"
- ✅ CurrentStepID: NULL (اكتمل السير)
- ✅ ApprovedDate: تاريخ ووقت الاعتماد

**في quotationcomparisons**:
```sql
SELECT 
    qc.ComparisonID,
    qc.Status,
    qc.ApprovalStatus,
    qc.SelectedQuotationID
FROM quotationcomparisons qc
WHERE qc.ComparisonID = <comparison_id>;
```
- ✅ Status: "Approved"
- ✅ ApprovalStatus: "Approved"

**في purchaseorders (تلقائي)**:
```sql
SELECT 
    po.POID,
    po.PONumber,
    po.QuotationID,
    po.Status,
    po.CreatedAt
FROM purchaseorders po
WHERE po.QuotationID = <selected_quotation_id>;
```
- ✅ تم إنشاء PO تلقائياً
- ✅ QuotationID: يشير للعرض الفائز

**في الواجهة**:
- ✅ حالة المقارنة: "Approved"
- ✅ تم إنشاء Purchase Order تلقائياً
- ✅ لا تظهر في قائمة Pending Approvals

#### معايير النجاح:
- اكتمل سير الاعتماد بـ 3 خطوات فقط
- تم إنشاء PO تلقائياً
- لم تطلب خطوة رابعة

---

### السيناريو 7: رفض من أي خطوة ✅

**الهدف**: التأكد من أن الرفض يعيد المقارنة لـ Draft

#### الخطوات:
1. أنشئ مقارنة جديدة وأرسلها للاعتماد
2. سجل دخول كـ PM (أو FM أو GM)
3. ابحث عن الطلب في Pending Approvals
4. اضغط "Reject" مع إدخال سبب الرفض

#### النتيجة المتوقعة:

**في approvalrequests**:
```sql
SELECT Status, CurrentStepID 
FROM approvalrequests 
WHERE DocumentType = 'QuotationComparison' 
  AND DocumentID = <comparison_id>;
```
- ✅ Status: "Rejected" أو "Cancelled"
- ✅ CurrentStepID: NULL

**في quotationcomparisons**:
```sql
SELECT 
    Status, 
    ApprovalStatus,
    RejectionCount,
    LastRejectionDate
FROM quotationcomparisons 
WHERE ComparisonID = <comparison_id>;
```
- ✅ Status: "Draft" (للسماح بإعادة التعديل)
- ✅ ApprovalStatus: "Rejected"
- ✅ RejectionCount: زاد بمقدار 1
- ✅ LastRejectionDate: تاريخ الرفض

**في الواجهة**:
- ✅ حالة المقارنة: "Draft"
- ✅ يمكن تعديل المقارنة
- ✅ يمكن إعادة الإرسال للاعتماد

#### معايير النجاح:
- الرفض يعيد المقارنة لـ Draft
- يمكن التعديل وإعادة الإرسال

---

### السيناريو 8: إعادة إرسال مقارنة مرفوضة ✅

**الهدف**: التأكد من إمكانية إعادة إرسال مقارنة مرفوضة

#### الخطوات:
1. استخدم المقارنة المرفوضة من السيناريو 7
2. عدّل المقارنة إذا لزم الأمر
3. أعد إرسالها للاعتماد

#### النتيجة المتوقعة:
- ✅ يتم إنشاء approval request جديد
- ✅ يبدأ السير من الخطوة الأولى (PM)
- ✅ RejectionCount يبقى كما هو (سجل تاريخي)

#### معايير النجاح:
- إعادة الإرسال تعمل بدون أخطاء
- السير يبدأ من البداية

---

## اختبارات قاعدة البيانات المباشرة

### الاختبار 1: عدد الخطوات
```sql
SELECT COUNT(*) AS 'Total Steps'
FROM approvalworkflowsteps
WHERE WorkflowID = (
    SELECT WorkflowID 
    FROM approvalworkflows 
    WHERE WorkflowCode = 'QC_APPROVAL'
);
```
**المتوقع**: 3

### الاختبار 2: لا توجد خطوة "Management Approval" منفصلة
```sql
SELECT StepName
FROM approvalworkflowsteps
WHERE WorkflowID = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL')
  AND StepName = 'Management Approval'
  AND StepName != 'General Manager Approval';
```
**المتوقع**: 0 صفوف (لا توجد)

### الاختبار 3: أسماء الخطوات صحيحة
```sql
SELECT 
    StepNumber,
    StepName,
    CASE 
        WHEN StepNumber = 1 AND StepName = 'Procurement Manager Approval' THEN '✅'
        WHEN StepNumber = 2 AND StepName = 'Finance Manager Approval' THEN '✅'
        WHEN StepNumber = 3 AND StepName = 'General Manager Approval' THEN '✅'
        ELSE '❌'
    END AS 'Status'
FROM approvalworkflowsteps
WHERE WorkflowID = (SELECT WorkflowID FROM approvalworkflows WHERE WorkflowCode = 'QC_APPROVAL')
ORDER BY StepNumber;
```
**المتوقع**: 3 صفوف كلها ✅

---

## قائمة التحقق النهائية

### قبل التطبيق على Production
- [ ] تم اختبار جميع السيناريوهات على بيئة التطوير
- [ ] تم عمل backup كامل لقاعدة البيانات
- [ ] تم التحقق من عدم وجود طلبات معلقة مهمة
- [ ] تم إبلاغ المستخدمين بالتحديث

### بعد التطبيق
- [ ] تم تنفيذ migration بنجاح (لا أخطاء)
- [ ] عدد الخطوات = 3 ✅
- [ ] لا توجد خطوة "Management Approval" زائدة ✅
- [ ] اختبار سيناريو كامل (إنشاء → PM → FM → GM → PO) ✅
- [ ] اختبار الرفض وإعادة الإرسال ✅
- [ ] مراجعة logs للتأكد من عدم وجود أخطاء

---

## الأخطاء المحتملة وحلولها

### خطأ: "A pending approval request already exists"
**السبب**: محاولة إرسال مقارنة لها طلب معلق بالفعل
**الحل**: 
1. إلغاء الطلب القديم
2. أو انتظار اكتمال/رفض الطلب الحالي

### خطأ: "Workflow not found: QC_APPROVAL"
**السبب**: الـ workflow غير موجود في قاعدة البيانات
**الحل**: 
1. تشغيل DataSeeder
2. أو تنفيذ `apply_qc_approval_workflow.sql`

### خطأ: "No steps defined for workflow"
**السبب**: لا توجد خطوات في الـ workflow
**الحل**:
1. تنفيذ `apply_qc_approval_workflow.sql`
2. إعادة تشغيل التطبيق

---

## التقارير

### تقرير نتائج الاختبار
```
┌──────────────────────────────────────────┬────────┐
│ السيناريو                                │ النتيجة │
├──────────────────────────────────────────┼────────┤
│ 1. التحقق من عدد الخطوات                │   ✅   │
│ 2. إنشاء مقارنة جديدة                   │   ✅   │
│ 3. إرسال للاعتماد                       │   ✅   │
│ 4. اعتماد PM                            │   ✅   │
│ 5. اعتماد FM                            │   ✅   │
│ 6. اعتماد GM + إنشاء PO                 │   ✅   │
│ 7. الرفض                                │   ✅   │
│ 8. إعادة الإرسال                        │   ✅   │
└──────────────────────────────────────────┴────────┘
```

---

**تاريخ الإنشاء**: 2026-02-14  
**الإصدار**: 1.0  
**المسؤول عن الاختبار**: _____________  
**تاريخ الاختبار**: _____________  
**النتيجة النهائية**: _____________
