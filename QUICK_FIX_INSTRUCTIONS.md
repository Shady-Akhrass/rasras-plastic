# 🚀 تعليمات الإصلاح السريع - Management Approval

## ⚡ الخطوات (5 دقائق فقط)

### 1️⃣ Backup ⚠️ (إلزامي)
```bash
mysqldump -u root -p rasrasplastics > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2️⃣ تنفيذ Migration
```bash
mysql -u root -p rasrasplastics < web/backend/migrations/remove_all_management_approval_steps.sql
```

### 3️⃣ إعادة تشغيل التطبيق
```bash
cd web/backend
./mvnw spring-boot:run
```

### 4️⃣ التحقق السريع
افتح المتصفح واضغط `Ctrl+Shift+R` (Hard Refresh)

---

## ✅ ما تم إصلاحه؟

1. ✅ **تعطيل WorkflowDataSeeder.java** (الكود الذي كان يسبب المشكلة)
2. ✅ **Migration Script جاهز** لحذف خطوات "Management Approval" من قاعدة البيانات

---

## 🎯 النتيجة المتوقعة

### قبل ❌
```
PO-68
اعتماد أوامر الشراء
Management Approval  ← خطأ!
```

### بعد ✅
```
PO-68
اعتماد أوامر الشراء
(لا توجد خطوات زائدة)
```

---

## 🔍 فحص سريع

```sql
-- يجب أن يعرض 0 صفوف
SELECT * FROM approvalworkflowsteps 
WHERE StepName = 'Management Approval'
  AND StepName != 'General Manager Approval';
```

---

## 📚 للمزيد من التفاصيل

راجع: **`WORKFLOW_MANAGEMENT_APPROVAL_FIX.md`**

---

**ملاحظة**: المشكلة كانت في `WorkflowDataSeeder.java` الذي كان يضيف خطوة خاطئة عند كل تشغيل!
