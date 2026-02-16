# دليل تشغيل SQL Migration لربط مراقب الجودة

## 📋 نظرة عامة

هذا الـ migration يقوم بربط دور **مراقب الجودة (QC)** الموجود مسبقاً في قاعدة البيانات بسير اعتمادات إذن الاستلام (GRN) ومرتجعات المشتريات (Return).

---

## ✅ قبل التشغيل - التحقق من المتطلبات

### 1. تحقق من وجود دور QC
قم بتشغيل هذا الاستعلام:

```sql
SELECT RoleID, RoleCode, RoleNameAr, RoleNameEn 
FROM roles 
WHERE RoleCode = 'QC';
```

**النتيجة المتوقعة:**
```
RoleID | RoleCode | RoleNameAr      | RoleNameEn
-------|----------|-----------------|------------------
7      | QC       | مراقبة الجودة   | Quality Control
```
أو
```
10     | QC       | مراقب جودة     | Quality Controller
```

✅ إذا ظهرت النتيجة → **يمكنك المتابعة**  
❌ إذا لم تظهر → **اتصل بالدعم الفني**

---

## 🚀 طريقة التشغيل

### الطريقة 1: من سطر الأوامر (Recommended)

```bash
# Windows (PowerShell أو CMD)
mysql -u root -p erp_database < "d:\Rasras Company\rasras-plastic\web\backend\migrations\update_workflows_for_quality.sql"

# إذا كنت في مجلد المشروع
cd "d:\Rasras Company\rasras-plastic\web\backend\migrations"
mysql -u root -p erp_database < update_workflows_for_quality.sql
```

### الطريقة 2: من MySQL Workbench

1. افتح MySQL Workbench
2. اتصل بقاعدة البيانات
3. افتح ملف `update_workflows_for_quality.sql`
4. اضغط على ⚡ Execute (أو Ctrl+Shift+Enter)
5. انتظر حتى تكتمل جميع الأوامر

### الطريقة 3: من phpMyAdmin

1. افتح phpMyAdmin
2. اختر قاعدة البيانات
3. اذهب لتبويب **SQL**
4. انسخ محتوى الملف والصقه
5. اضغط **Go**

---

## 📊 ما سيحدث عند التشغيل

### المرحلة 0: فحص أولي ✓
```
✓ دور QC موجود (RoleID: 7)
```

### المرحلة 1: التحقق من الدور ✓
- يتأكد من وجود QC (لن يضيفه إذا كان موجوداً)

### المرحلة 2: إضافة الصلاحيات ✓
```
الدور | الاسم          | الصلاحيات
------|----------------|---------------------------
QC    | مراقب الجودة  | SECTION_MAIN, SECTION_OPERATIONS
```

### المرحلة 3: تحديث GRN Workflow ✓
```
تم العثور على جميع المتطلبات ✓
```
- يحذف الخطوات القديمة
- يضيف: خطوة 1 = QC، خطوة 2 = PM

### المرحلة 4: تحديث Return Workflow ✓
- يحذف الخطوات القديمة
- يضيف: خطوة 1 = QC

### المرحلة 5: تحديث الطلبات المعلقة ✓
- يحدّث طلبات GRN و Return المعلقة

### المرحلة 6: التحقق النهائي ✓
```
كود سير العمل | رقم الخطوة | اسم الخطوة                    | كود الدور | اسم الدور
---------------|-------------|-------------------------------|-----------|----------------
GRN_APPROVAL   | 1           | Quality Controller Approval   | QC        | مراقب الجودة
GRN_APPROVAL   | 2           | Procurement Manager Approval  | PM        | مدير المشتريات
RET_APPROVAL   | 1           | Quality Controller Approval   | QC        | مراقب الجودة
```

---

## ⚠️ ملاحظات مهمة

### 1. النسخ الاحتياطي (IMPORTANT!)
**قبل التشغيل، قم بعمل backup:**

```bash
mysqldump -u root -p erp_database > backup_before_qc_migration.sql
```

### 2. الطلبات المعلقة
- أي GRN أو Return معلق سيعود لخطوة QC
- هذا متعمد ومطلوب منطقياً

### 3. الأمان
- ✅ آمن للتشغيل المتكرر
- ✅ يستخدم `WHERE NOT EXISTS`
- ✅ لا يحذف بيانات

### 4. التوقيت
- يستغرق أقل من دقيقة
- يعتمد على عدد الطلبات المعلقة

---

## 🔍 التحقق بعد التشغيل

### 1. تحقق من Workflows
```sql
SELECT 
    aw.WorkflowCode,
    aws.StepNumber,
    aws.StepName,
    r.RoleCode
FROM approvalworkflows aw
INNER JOIN approvalworkflowsteps aws ON aw.WorkflowID = aws.WorkflowID
LEFT JOIN roles r ON aws.ApproverRoleID = r.RoleID
WHERE aw.WorkflowCode IN ('GRN_APPROVAL', 'RET_APPROVAL')
ORDER BY aw.WorkflowCode, aws.StepNumber;
```

**يجب أن ترى:**
- GRN_APPROVAL: خطوتين (QC ثم PM)
- RET_APPROVAL: خطوة واحدة (QC)

### 2. تحقق من الطلبات المعلقة
```sql
SELECT 
    aw.WorkflowCode,
    COUNT(*) as 'عدد الطلبات',
    aws.StepName as 'الخطوة الحالية'
FROM approvalrequests ar
INNER JOIN approvalworkflows aw ON ar.WorkflowID = aw.WorkflowID
INNER JOIN approvalworkflowsteps aws ON ar.CurrentStepID = aws.StepID
WHERE aw.WorkflowCode IN ('GRN_APPROVAL', 'RET_APPROVAL')
  AND ar.Status IN ('Pending', 'InProgress')
GROUP BY aw.WorkflowCode, aws.StepName;
```

---

## 🔄 إعادة تشغيل الباكند

بعد تنفيذ Migration بنجاح:

```bash
# إذا كان الباكند يعمل
# أوقفه (Ctrl+C في terminal 6)
# ثم شغّله من جديد:
cd "d:\Rasras Company\rasras-plastic\web\backend"
.\mvnw spring-boot:run
```

أو ببساطة أعد تشغيل السيرفر.

---

## ❓ استكشاف الأخطاء

### خطأ: "دور QC غير موجود"
**الحل:** قم بإنشاء الدور أولاً:
```sql
INSERT INTO roles (RoleCode, RoleNameAr, RoleNameEn, Description, IsActive, CreatedAt)
VALUES ('QC', 'مراقب الجودة', 'Quality Controller', 'فحص واعتماد الجودة', 1, NOW());
```

### خطأ: "Foreign key constraint fails"
**الحل:** تأكد من وجود:
- جدول `approvalworkflows`
- جدول `approvalworkflowsteps`
- workflows بأكواد GRN_APPROVAL و RET_APPROVAL

### خطأ: "Access denied"
**الحل:** تأكد من:
- استخدام مستخدم له صلاحيات كاملة (root)
- كتابة كلمة المرور الصحيحة

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع الأخطاء في terminal
2. تأكد من النسخة الاحتياطية
3. اتصل بفريق التطوير

---

## ✅ Checklist

- [ ] أخذ نسخة احتياطية
- [ ] التحقق من وجود دور QC
- [ ] تشغيل Migration
- [ ] التحقق من النتائج
- [ ] إعادة تشغيل الباكند
- [ ] اختبار من واجهة المستخدم

---

**تاريخ آخر تحديث:** 2026-02-13  
**الإصدار:** 1.0
