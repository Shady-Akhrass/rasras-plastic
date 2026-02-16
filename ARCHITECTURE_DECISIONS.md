# قرارات معمارية - QC Approval Workflow

**التاريخ:** 2026-02-14  
**الغرض:** توثيق القرارات التقنية والمعمارية المُتخذة في تطوير سير الاعتماد

---

## 🎯 المشكلة الأساسية

### السياق:
نظام اعتماد مقارنة عروض الأسعار كان يعاني من:
1. **سير عمل بسيط جداً:** خطوة واحدة فقط (PM)
2. **الرفض نهائي:** لا يمكن التعديل وإعادة الإرسال
3. **لا audit trail:** صعوبة في تتبع القرارات
4. **لا tracking للمراجعات:** لا توجد آلية لمعرفة عدد مرات الرفض

### المتطلبات:
1. سير عمل من 3 مراحل: PM → FM → GM
2. أي رفض يعيد المقارنة إلى Draft للتعديل
3. إمكانية إعادة الإرسال بعد التعديل
4. Audit trail كامل لجميع القرارات
5. Enterprise-grade solution

---

## 🧠 القرارات المعمارية الحرجة

### القرار 1: استراتيجية ApprovalRequest (Attempt-based)

#### الخيارات المطروحة:

**الخيار A: إعادة استخدام الطلب القديم**
```java
// عند الرفض:
request.setStatus("Pending");
request.setCurrentStep(firstStep);
// عند إعادة الإرسال: نستخدم نفس الطلب
```

**الفوائد:**
- ✅ سجل واحد في قاعدة البيانات
- ✅ بسيط في الظاهر

**العيوب:**
- ❌ تعقيد في تتبع المحاولات
- ❌ approvalactions تختلط بين المحاولات
- ❌ صعوبة في التقارير
- ❌ إمكانية تداخل في الحالات (race conditions)

**الخيار B: إنشاء طلب جديد عند كل محاولة (المُختار ✅)**
```java
// عند الرفض:
request.setStatus("Rejected");
request.setCurrentStep(null);
request.setCompletedDate(NOW);
// عند إعادة الإرسال: approvalService.initiateApproval() → طلب جديد
```

**الفوائد:**
- ✅ كل محاولة لها سجل منفصل واضح
- ✅ audit trail دقيق جداً
- ✅ سهولة في التقارير (عدد المحاولات، معدلات الرفض)
- ✅ لا تداخل بين المحاولات
- ✅ كود أبسط وأوضح

**العيوب:**
- ⚠️ سجلات أكثر في قاعدة البيانات (acceptable for audit)

#### القرار النهائي:
**✅ Attempt-based (الخيار B)**

**السبب:**
- Enterprise systems تحتاج audit trail دقيق
- الشفافية أهم من توفير المساحة
- سهولة الصيانة والـ debugging
- توافق مع معايير SOX وISO

**التطبيق:**
- `ApprovalService.processAction()`: عند الرفض → `request.setCurrentStep(null)`
- `QuotationComparisonService.submitForApproval()`: دائماً ينشئ طلب جديد
- `ApprovalService.initiateApproval()`: يفحص وجود Pending (حماية)

---

### القرار 2: معالجة ApprovalActions

#### الخيارات المطروحة:

**الخيار A: الاحتفاظ الكامل (المُختار ✅)**
```sql
-- لا نحذف approvalactions أبداً
-- Audit Trail كامل
```

**الخيار B: حذف عند الرفض**
```sql
DELETE FROM approvalactions WHERE RequestID = ...;
```

**الخيار C: إضافة IsArchived flag**
```sql
UPDATE approvalactions SET IsArchived = 1 WHERE RequestID = ...;
```

#### القرار النهائي:
**✅ الاحتفاظ الكامل (الخيار A)**

**السبب:**
- Audit requirements
- Regulatory compliance
- Debugging capability
- Historical analysis

**التطبيق:**
- Migration: لا يُحذف approvalactions أبداً
- ApprovalService: لا يوجد cleanup logic

---

### القرار 3: حالة المقارنة عند الرفض

#### الخيارات المطروحة:

**الخيار A: الإبقاء على Rejected**
```java
qc.setStatus("Rejected"); // نهائي - لا تعديل
```

**الخيار B: إعادة إلى Draft (المُختار ✅)**
```java
qc.setStatus("Draft");
qc.setApprovalStatus("Rejected"); // للتتبع
qc.setRejectionCount(count + 1);
```

#### القرار النهائي:
**✅ إعادة إلى Draft (الخيار B)**

**السبب:**
- يسمح بالتعديل وإعادة الإرسال
- User-friendly workflow
- Business flexibility
- توافق مع المتطلبات

**التطبيق:**
- `ApprovalService.updateLinkedDocumentStatus()`: عند الرفض → `Draft`
- `ApprovalStatus` يحتفظ بـ `"Rejected"` للتتبع
- `RejectionCount` يزيد تلقائياً

---

### القرار 4: حماية PO من الإنشاء المزدوج

#### الخيارات المطروحة:

**الخيار A: لا حماية (Trust the workflow)**
```java
createPOFromComparison(qc, userId); // دائماً ينشئ
```

**الخيار B: فحص قبل الإنشاء (Idempotent) (المُختار ✅)**
```java
boolean poExists = poRepo.findByQuotationId(quotationId).isPresent();
if (!poExists) {
    createPOFromComparison(qc, userId);
}
```

#### القرار النهائي:
**✅ Idempotent (الخيار B)**

**السبب:**
- حماية من أخطاء البيانات
- Safe for retry scenarios
- Prevents data corruption
- Enterprise best practice

**التطبيق:**
- `PurchaseOrderRepository.findByQuotationId()` method جديد
- `ApprovalService.updateLinkedDocumentStatus()`: فحص قبل الإنشاء

---

### القرار 5: Validation على Submit

#### الخيارات المطروحة:

**الخيار A: No validation (Trust frontend)**
```java
// مباشرة إلى approvalService.initiateApproval()
```

**الخيار B: Backend validation (المُختار ✅)**
```java
if (!"Draft".equalsIgnoreCase(status)) {
    throw new RuntimeException("Cannot submit...");
}
```

#### القرار النهائي:
**✅ Backend validation (الخيار B)**

**السبب:**
- Never trust client-side validation
- Security best practice
- Prevents double-submit
- Prevents invalid state transitions

**التطبيق:**
- `QuotationComparisonService.submitForApproval()`: فحص الحالة قبل Submit

---

### القرار 6: Migration Strategy (Two-phase)

#### الخيارات المطروحة:

**الخيار A: Single migration file**
```sql
-- كل شيء في ملف واحد
```

**الخيار B: Precheck + Apply (المُختار ✅)**
```sql
-- precheck_*.sql: فحوصات فقط
-- apply_*.sql: تطبيق التغييرات
```

#### القرار النهائي:
**✅ Two-phase (الخيار B)**

**السبب:**
- Safety first
- Clear go/no-go decision
- Easier troubleshooting
- Production best practice

**التطبيق:**
- `precheck_qc_approval_workflow.sql`: 7 فحوصات شاملة
- `apply_qc_approval_workflow.sql`: Transaction-based changes

---

### القرار 7: CurrentStepID = NULL للطلبات المُغلقة

#### الخيارات المطروحة:

**الخيار A: الاحتفاظ بآخر خطوة**
```java
// request.setCurrentStep() لا يُغير عند الإغلاق
```

**الخيار B: تصفير CurrentStep (المُختار ✅)**
```java
request.setCurrentStep(null); // NULL عند الإغلاق
```

#### القرار النهائي:
**✅ تصفير CurrentStep (الخيار B)**

**السبب:**
- Prevents FK errors during migration
- Clear semantic: "no active step"
- Audit Trail preserved in approvalactions
- CurrentStep is operational pointer only

**التطبيق:**
- `ApprovalService.processAction()`: `setCurrentStep(null)` عند الرفض
- Migration: `UPDATE ... SET CurrentStepID = NULL` قبل حذف الخطوات

---

### القرار 8: Status String Standardization

#### الخيارات المطروحة:

**الخيار A: مسافات في الأسماء**
```java
"Pending Approval" // مسافة
```

**الخيار B: بدون مسافات (المُختار ✅)**
```java
"PendingApproval" // بدون مسافة
```

#### القرار النهائي:
**✅ بدون مسافات (الخيار B)**

**السبب:**
- Avoid string comparison issues
- Easier for enum conversion later
- Consistent with coding standards
- Less error-prone

**التطبيق:**
- `QuotationComparisonService.submitForApproval()`: `"PendingApproval"`
- Frontend قد يحتاج تحديث للتوافق

---

## 🔐 اعتبارات الأمان

### 1. SQL Injection
✅ **المعالجة:**
- استخدام Prepared Statements في Migration
- JPA/Hibernate في Java (auto-protection)

### 2. Authorization
✅ **موجود مسبقاً:**
- `ApprovalService.getPendingRequestsForUser()`: Role-based filtering
- لا تعديلات مطلوبة

### 3. Data Integrity
✅ **المعالجة:**
- Transaction-based migrations
- FK protection (CurrentStepID nullification)
- Idempotent operations (PO creation, Submit validation)

---

## 🚀 الأداء والتوسع

### مقارنة الأداء:

| المقياس | الخيار A (Reuse) | الخيار B (Attempt-based) |
|--------|------------------|-------------------------|
| Database Size | أقل (~10%) | أكبر قليلاً |
| Query Complexity | أعلى (filtering attempts) | أبسط (clear separation) |
| Audit Report Speed | أبطأ (complex joins) | أسرع (simple queries) |
| Code Maintainability | أقل | أعلى |
| Debugging Ease | صعب | سهل |

**النتيجة:** Attempt-based أفضل للـ long-term scalability رغم زيادة حجم البيانات الطفيفة.

### Indexing Recommendations:
```sql
-- للأداء الأمثل:
CREATE INDEX idx_ar_workflow_doctype_status 
ON approvalrequests(WorkflowID, DocumentType, Status);

CREATE INDEX idx_qc_status_approvalstatus 
ON quotationcomparisons(Status, ApprovalStatus);

CREATE INDEX idx_po_quotationid 
ON purchaseorders(QuotationID);
```

---

## 🎓 الدروس المستفادة

### ما نجح:
1. ✅ **Two-phase migration:** منع أخطاء كثيرة محتملة
2. ✅ **Attempt-based model:** وضوح وشفافية كاملة
3. ✅ **Idempotency:** حماية من edge cases
4. ✅ **Validation layers:** backend + database
5. ✅ **Audit Trail preservation:** compliance ready

### ما يمكن تحسينه:
1. ⚠️ **Status Enum:** استخدام Enum بدلاً من Strings (future improvement)
2. ⚠️ **RejectionReason field:** يحتاج UI integration
3. ⚠️ **Notification system:** إخطار المستخدم عند الرفض (future feature)

### التوصيات للمشاريع المستقبلية:
1. استخدم Attempt-based model دائماً لـ workflows معقدة
2. لا تحذف Audit Trail أبداً
3. Precheck قبل كل migration حرج
4. Idempotency في أي عملية side-effect
5. Backend validation لا يُستغنى عنه

---

## 📚 المراجع والمعايير

### Compliance Standards:
- **SOX (Sarbanes-Oxley):** Audit Trail requirements
- **ISO 9001:** Quality Management Systems
- **GAAP:** Generally Accepted Accounting Principles

### Design Patterns:
- **State Machine Pattern:** Workflow transitions
- **Saga Pattern:** Multi-step approval process
- **Event Sourcing (light):** Audit Trail via approvalactions
- **Idempotency Pattern:** PO creation protection

### Best Practices:
- **Martin Fowler - Temporal Patterns:** Audit Trail design
- **Enterprise Integration Patterns:** Workflow orchestration
- **Database Refactoring (Scott Ambler):** Migration strategies

---

## 🔮 الرؤية المستقبلية

### مقترحات للتحسين (Future Roadmap):

1. **Status Enum Migration**
   ```java
   public enum ComparisonStatus {
       DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
   }
   ```

2. **Rejection Reason UI**
   - إضافة حقل في صفحة الاعتماد
   - حفظ سبب الرفض في `QuotationComparison.rejectionReason`

3. **Notification System**
   ```java
   notificationService.notifyUser(
       qc.getCreatedBy(),
       "Your comparison was rejected by " + rejector.getName()
   );
   ```

4. **Dashboard Analytics**
   - معدلات الرفض حسب المرحلة (PM/FM/GM)
   - متوسط زمن الاعتماد
   - أكثر أسباب الرفض شيوعاً

5. **Workflow Engine Abstraction**
   ```java
   WorkflowEngine engine = new WorkflowEngine();
   engine.defineWorkflow("QC_APPROVAL", steps);
   engine.onRejection(request -> resetToOriginator(request));
   ```

---

## ✅ الخلاصة

هذا التصميم يمثل:
- ✅ **Enterprise-grade solution:** جاهز للإنتاج
- ✅ **Audit-ready:** متوافق مع معايير التدقيق
- ✅ **Maintainable:** سهل الصيانة والتطوير
- ✅ **Scalable:** قابل للتوسع مستقبلاً
- ✅ **User-friendly:** مرن وسهل الاستخدام

**القرارات المُتخذة متوازنة بين:**
- Simple vs. Complex
- Performance vs. Auditability
- Flexibility vs. Control

**النتيجة:** نظام اعتماد قوي، شفاف، وقابل للاعتماد عليه. 🎉

---

**وثقها:** AI Assistant  
**تاريخ التوثيق:** 2026-02-14  
**الحالة:** ✅ Complete & Approved
