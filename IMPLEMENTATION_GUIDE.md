# دليل تنفيذ تحديث QC Approval Workflow

**التاريخ:** 2026-02-14  
**النسخة:** 1.0 - Enterprise Grade  
**الحالة:** ✅ جاهز للتطبيق

---

## 📋 ملخص التغييرات

تم تحديث سير اعتماد مقارنة عروض الأسعار (Quotation Comparison) من نموذج بسيط (خطوة واحدة) إلى نموذج مؤسسي متكامل:

### قبل التحديث:
- خطوة واحدة: مدير المشتريات (PM) فقط
- الرفض نهائي - لا يمكن التعديل
- لا توجد آلية لتتبع المراجعات

### بعد التحديث:
- ✅ **3 مراحل متسلسلة:** PM → FM → GM
- ✅ **الرفض قابل للتعديل:** أي رفض يعيد المقارنة إلى Draft
- ✅ **Audit Trail كامل:** كل محاولة اعتماد لها سجل منفصل
- ✅ **تتبع المراجعات:** RejectionCount, LastRejectionDate, RejectionReason
- ✅ **حماية من الازدواجية:** منع إنشاء PO مزدوج، منع Submit المكرر
- ✅ **Attempt-based approvals:** طلب جديد عند كل إعادة إرسال

---

## 🔧 التعديلات المنفذة

### 1. ملفات Java المُعدلة

#### A. QuotationComparison.java
**المسار:** `web/backend/src/main/java/com/rasras/erp/procurement/QuotationComparison.java`

**التغييرات:**
- ✅ إضافة 3 حقول جديدة:
  - `rejectionCount` (Integer): عدد مرات الرفض
  - `lastRejectionDate` (LocalDateTime): تاريخ آخر رفض
  - `rejectionReason` (String): سبب الرفض

#### B. PurchaseOrderRepository.java
**المسار:** `web/backend/src/main/java/com/rasras/erp/procurement/PurchaseOrderRepository.java`

**التغييرات:**
- ✅ إضافة method جديد:
  ```java
  Optional<PurchaseOrder> findByQuotationId(Integer quotationId);
  ```
- **الهدف:** فحص وجود PO لمنع الإنشاء المزدوج

#### C. ApprovalService.java
**المسار:** `web/backend/src/main/java/com/rasras/erp/approval/ApprovalService.java`

**التغييرات:**

1. **في `processAction()` و `syncAction()`:**
   - ✅ عند الرفض: `request.setCurrentStep(null)` - إغلاق الطلب نهائياً
   - ✅ Strategy B: الطلب القديم يُغلق ولا يُعاد استخدامه

2. **في `updateLinkedDocumentStatus()` - QuotationComparison:**
   - ✅ **عند الاعتماد:**
     - فحص وجود PO قبل الإنشاء (Idempotent)
     - إنشاء PO فقط إذا لم يكن موجوداً
   - ✅ **عند الرفض:**
     - `qc.setStatus("Draft")` - إعادة المقارنة للتعديل
     - `qc.setApprovalStatus("Rejected")` - تتبع آخر نتيجة
     - زيادة `RejectionCount`
     - تحديث `LastRejectionDate`

#### D. QuotationComparisonService.java
**المسار:** `web/backend/src/main/java/com/rasras/erp/procurement/QuotationComparisonService.java`

**التغييرات في `submitForApproval()`:**
- ✅ **Validation 1:** فحص وجود عرض فائز
- ✅ **Validation 2 (جديد):** فحص أن المقارنة في حالة `Draft`
  - يمنع Submit مزدوج
  - يمنع إرسال مقارنة معتمدة بالفعل
  - رسالة خطأ واضحة للمستخدم
- ✅ توحيد Status: `"PendingApproval"` بدون مسافات

#### E. DataSeeder.java (اختياري)
**المسار:** `web/backend/src/main/java/com/rasras/erp/user/DataSeeder.java`

**التغييرات:**
- ✅ إضافة خطوتي FM و GM في QC_APPROVAL workflow
- **ملاحظة:** يؤثر فقط على المشاريع الجديدة، لا يؤثر على الإنتاج

---

### 2. ملفات Migration SQL

تم إنشاء 3 ملفات migration في المجلد:
`web/backend/migrations/`

#### A. add_rejection_tracking_columns.sql
**الهدف:** إضافة أعمدة تتبع المراجعات

**المحتوى:**
- إضافة 3 أعمدة جديدة في `quotationcomparisons`:
  - `RejectionCount` (INT, default 0)
  - `LastRejectionDate` (DATETIME, nullable)
  - `RejectionReason` (TEXT, nullable)

**الترتيب:** ⚠️ **يجب تشغيله أولاً** قبل apply script

#### B. precheck_qc_approval_workflow.sql
**الهدف:** فحص النظام قبل تطبيق التحديثات

**الفحوصات:**
1. ✅ وجود الأدوار المطلوبة (PM, FM, GM)
2. ✅ وجود QC_APPROVAL workflow
3. ℹ️ عرض الخطوات الحالية
4. ℹ️ عرض الطلبات المتأثرة (Pending/InProgress)
5. ℹ️ عرض المقارنات المرفوضة (ستُعاد لـ Draft)
6. ✅ وجود أعمدة RejectionTracking
7. ⚠️ فحص Foreign Key بين approvalactions و approvalworkflowsteps

**النتيجة المطلوبة:** `✅ ALL CHECKS PASSED - SAFE TO PROCEED`

#### C. apply_qc_approval_workflow.sql
**الهدف:** تطبيق التحديثات على قاعدة البيانات

**الخطوات:**
1. **Step 0 (Critical):** التأكد من وجود أعمدة RejectionTracking
2. **Step A:** إعداد المتغيرات (@qc_workflow_id, @pm_role_id, etc.)
3. **Step B:** تحديث Workflow Steps:
   - B1: إغلاق الطلبات المعلقة/الجارية
   - B2: ⚠️ **CRITICAL** - تصفير CurrentStepID لجميع الطلبات (حماية FK)
   - B3: الحفاظ على approvalactions (Audit Trail)
   - B4: حذف/أرشفة الخطوات القديمة
   - B5: إضافة 3 خطوات جديدة (PM, FM, GM)
4. **Step C:** إعادة المقارنات المرفوضة إلى Draft
5. **Step D:** التحقق النهائي

**الأمان:**
- ✅ Transaction-based (START TRANSACTION / COMMIT)
- ✅ حماية من FK errors
- ✅ الحفاظ على Audit Trail الكامل
- ✅ حماية ضد المقارنات المرتبطة بـ PO

---

## 📝 خطوات التنفيذ (Production)

### المرحلة 0: الاستعدادات (قبل أي شيء)

1. ✅ **Backup كامل لقاعدة البيانات**
   ```bash
   mysqldump -u root -p erp_db > backup_before_qc_workflow_update.sql
   ```

2. ✅ **تنبيه المستخدمين**
   - إيقاف العمل على مقارنات عروض الأسعار مؤقتاً
   - عدم إرسال طلبات اعتماد جديدة

3. ✅ **التأكد من عدم وجود عمليات جارية**
   ```sql
   SELECT * FROM approvalrequests 
   WHERE Status IN ('Pending', 'InProgress')
     AND DocumentType = 'QuotationComparison';
   ```

### المرحلة 1: تحديث قاعدة البيانات

#### الخطوة 1.1: إضافة أعمدة RejectionTracking
```bash
mysql -u root -p erp_db < web/backend/migrations/add_rejection_tracking_columns.sql
```

**المتوقع:**
```
✅ جدول quotationcomparisons موجود
Columns Added Successfully
```

#### الخطوة 1.2: تشغيل Precheck
```bash
mysql -u root -p erp_db < web/backend/migrations/precheck_qc_approval_workflow.sql
```

**المتوقع:**
```
✅✅✅ ALL CHECKS PASSED - SAFE TO PROCEED ✅✅✅
Next step: Run apply_qc_approval_workflow.sql
```

⚠️ **إذا ظهر `❌ SOME CHECKS FAILED`:**
- توقف فوراً
- راجع الأخطاء
- صحح المشاكل قبل المتابعة

#### الخطوة 1.3: تطبيق التحديثات
```bash
mysql -u root -p erp_db < web/backend/migrations/apply_qc_approval_workflow.sql
```

**المتوقع:**
```
✅ Requests closed (attempts cancelled - not document rejection)
✅ Requests with CurrentStepID nullified (FK protection)
✅ approvalactions preserved (no deletion)
✅ Old steps deleted (no FK constraint)
✅ New steps added (should be 3)
✅ Comparisons reset to Draft (historical)
✅✅✅ TRANSACTION COMMITTED SUCCESSFULLY ✅✅✅
```

⚠️ **إذا حدث خطأ:**
```sql
ROLLBACK;
```
- راجع الخطأ
- راجع precheck results
- اطلب المساعدة قبل إعادة المحاولة

### المرحلة 2: تحديث الكود

#### الخطوة 2.1: Git Commit (اختياري)
```bash
git add .
git commit -m "feat: Upgrade QC Approval Workflow to Enterprise Grade (PM→FM→GM)"
```

#### الخطوة 2.2: Compile Backend
```bash
cd web/backend
mvn clean install -DskipTests
```

**المتوقع:**
```
[INFO] BUILD SUCCESS
```

⚠️ **إذا فشل Compile:**
- راجع أخطاء الترجمة
- تأكد من أن جميع التعديلات صحيحة
- راجع Linter errors

#### الخطوة 2.3: إعادة تشغيل Backend
```bash
# إيقاف Backend الحالي
# ثم:
java -jar target/erp-backend-0.0.1-SNAPSHOT.jar
# أو
mvn spring-boot:run
```

**المتوقع:**
```
Started ErpApplication in X.XXX seconds
```

### المرحلة 3: الاختبار الشامل

#### السيناريو 1: مسار الاعتماد الكامل (Happy Path)

1. **إنشاء مقارنة جديدة**
   - Status = `Draft`
   - اختيار عرض فائز

2. **Submit للاعتماد**
   - يجب أن تتحول إلى `PendingApproval`
   - يُنشأ `approvalrequest` جديد
   - CurrentStep = Step 1 (PM)

3. **اعتماد PM**
   - CurrentStep ينتقل لـ Step 2 (FM)
   - Status = `InProgress`

4. **اعتماد FM**
   - CurrentStep ينتقل لـ Step 3 (GM)
   - Status = `InProgress`

5. **اعتماد GM (Final)**
   - Status = `Approved`
   - ApprovalStatus = `Approved`
   - يُنشأ PO تلقائياً ✅
   - **التحقق:** لا يُنشأ PO مزدوج (Idempotent)

#### السيناريو 2: الرفض من PM

1. **إنشاء مقارنة → Submit**
2. **رفض من PM**
   - المقارنة تعود لـ `Draft` ✅
   - ApprovalStatus = `Rejected`
   - RejectionCount = 1 ✅
   - LastRejectionDate محدّث ✅
   - approvalrequest مُغلق (Status = `Rejected`) ✅
   - CurrentStepID = NULL ✅
3. **تعديل المقارنة**
   - يمكن التعديل (Status = `Draft`) ✅
4. **Submit مرة أخرى**
   - يُنشأ `approvalrequest` جديد ✅
   - RejectionCount = 1 (محفوظ) ✅
   - يبدأ من PM من جديد ✅

#### السيناريو 3: الرفض من FM

(نفس السيناريو 2، لكن الرفض يحدث من FM بعد اعتماد PM)

#### السيناريو 4: الرفض من GM

(نفس السيناريو 2، لكن الرفض يحدث من GM بعد اعتماد PM و FM)

#### السيناريو 5: منع Submit المزدوج

1. **إنشاء مقارنة → Submit**
2. **محاولة Submit مرة أخرى (بدون رفض)**
   - يجب أن يفشل ✅
   - رسالة: `"Cannot submit comparison in status 'PendingApproval'..."`

#### السيناريو 6: منع PO مزدوج

1. **اعتماد كامل → PO يُنشأ**
2. **إعادة تشغيل عملية الاعتماد يدوياً (محاكاة)**
   - يجب ألا يُنشأ PO جديد ✅
   - Console log: `"PO already exists for quotation X - skipping creation"`

---

## 🔍 Edge Cases المعالجة

### 1. طلبات معلقة أثناء التحديث
✅ **المعالجة:**
- يتم إغلاقها تلقائياً في Migration (Status = `Rejected`)
- المقارنات المرتبطة بها تُعاد إلى `Draft`
- المستخدم يمكنه تعديلها وإعادة إرسالها

### 2. مقارنات مرفوضة تاريخياً
✅ **المعالجة:**
- Migration يعيدها إلى `Draft` تلقائياً
- ⚠️ **حماية:** إذا كان لها PO موجود، لا تُمس

### 3. Foreign Key Constraints
✅ **المعالجة:**
- تصفير `CurrentStepID` لجميع الطلبات قبل حذف الخطوات
- خيار Archive في apply script إذا كان FK موجود

### 4. Audit Trail
✅ **المعالجة:**
- لا يتم حذف `approvalactions` أبداً
- كل محاولة اعتماد لها approvalrequest منفصل
- سجل كامل لجميع القرارات

### 5. إعادة الاعتماد بعد الرفض
✅ **المعالجة:**
- طلب جديد يُنشأ في كل مرة (Attempt-based)
- الطلب القديم يبقى في قاعدة البيانات كسجل تاريخي
- RejectionCount يتتبع عدد المحاولات

---

## 📊 الفوائد المؤسسية

### للأعمال:
- ✅ شفافية كاملة في عملية الاعتماد
- ✅ تتبع دقيق لجميع القرارات
- ✅ تقارير واضحة عن معدلات الرفض
- ✅ إمكانية تحليل أسباب الرفض

### للمطورين:
- ✅ كود نظيف وواضح
- ✅ سهولة في Debug والصيانة
- ✅ لا توجد إعادة استخدام معقدة للطلبات
- ✅ Idempotency في العمليات الحرجة

### للمراجعين والـ Auditors:
- ✅ Audit Trail كامل لا يُحذف
- ✅ كل محاولة لها سجل منفصل
- ✅ سهولة في معرفة "من فعل ماذا ومتى"
- ✅ Compliance مع معايير الجودة

---

## ⚠️ ملاحظات مهمة

### القيود والاعتبارات:
1. **DataSeeder.java:**
   - التعديلات تؤثر فقط على المشاريع الجديدة
   - لا تؤثر على قاعدة البيانات الحالية

2. **Migration:**
   - يجب تشغيل Scripts بالترتيب المحدد
   - عدم تخطي Precheck
   - عمل Backup قبل Apply

3. **Audit Trail:**
   - approvalactions تبقى للأبد
   - CurrentStep = NULL للطلبات المُغلقة (طبيعي)
   - استخدم approvalactions لعرض التاريخ

4. **Status Strings:**
   - تم توحيد الأسماء: `"PendingApproval"` (بدون مسافات)
   - تأكد من توافق Frontend مع الأسماء الجديدة

---

## 🚨 استكشاف الأخطاء

### المشكلة: Migration يفشل عند حذف approvalworkflowsteps
**السبب:** FK constraint من approvalactions.StepID
**الحل:**
1. راجع Check 7 في precheck results
2. استخدم Archive strategy بدلاً من DELETE في apply script
3. أو: فك FK مؤقتاً، احذف الخطوات، أعد FK

### المشكلة: "Cannot submit comparison in status 'PendingApproval'"
**السبب:** محاولة Submit مزدوج (مقصود - ليس خطأ)
**الحل:** هذا سلوك صحيح - الحماية تعمل ✅

### المشكلة: PO يُنشأ مرتين
**السبب:** فشل حماية Idempotency
**الحل:**
1. تأكد من وجود `findByQuotationId()` في PurchaseOrderRepository
2. تأكد من تطبيق تعديلات ApprovalService بشكل صحيح

### المشكلة: RejectionCount لا يزيد
**السبب:** أعمدة RejectionTracking غير موجودة
**الحل:**
1. تأكد من تشغيل add_rejection_tracking_columns.sql
2. راجع precheck Check 6

---

## 📞 الدعم

إذا واجهت أي مشاكل أثناء التنفيذ:

1. ✅ راجع precheck results
2. ✅ راجع logs في Console/Backend
3. ✅ تحقق من Backup قبل أي rollback
4. ✅ راجع هذا الدليل بعناية
5. ✅ اطلب المساعدة مع تفاصيل الخطأ الكاملة

---

## ✅ Checklist التنفيذ

- [ ] Backup قاعدة البيانات
- [ ] تنبيه المستخدمين
- [ ] تشغيل add_rejection_tracking_columns.sql
- [ ] تشغيل precheck_qc_approval_workflow.sql
- [ ] التحقق من نتيجة Precheck (ALL PASSED)
- [ ] تشغيل apply_qc_approval_workflow.sql
- [ ] التحقق من COMMIT SUCCESS
- [ ] Compile Backend (mvn clean install)
- [ ] إعادة تشغيل Backend
- [ ] اختبار السيناريو 1 (Happy Path)
- [ ] اختبار السيناريو 2 (رفض PM)
- [ ] اختبار السيناريو 3 (رفض FM)
- [ ] اختبار السيناريو 4 (رفض GM)
- [ ] اختبار السيناريو 5 (منع Submit مزدوج)
- [ ] اختبار السيناريو 6 (منع PO مزدوج)
- [ ] التحقق من Audit Trail
- [ ] التحقق من RejectionCount
- [ ] إبلاغ المستخدمين بالتحديث

---

**تم التنفيذ بواسطة:** AI Assistant  
**التاريخ:** 2026-02-14  
**الحالة:** ✅ جاهز للإنتاج

**رأي تقني:** هذا الحل مُصمم بمعايير Enterprise-Grade، مع تركيز على:
- Data Integrity (FK protection, Audit Trail)
- Idempotency (PO creation, Submit validation)
- User Experience (rejection → edit → resubmit flow)
- Compliance (full audit history)

**🎉 نجاح التنفيذ يعني: workflow مؤسسي قوي، شفاف، وقابل للصيانة!**
