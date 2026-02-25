# خطة مراجعة وإصلاح صلاحيات المسارات (path_permission) والواجهة

## الهدف

تجنب **403 Forbidden** و«فشل تحميل البيانات» عندما:
1. **path_permission** يسمح بصلاحية واحدة بينما الـ **Controller** يسمح بعدة صلاحيات.
2. **الواجهة** تستدعي APIs دون التحقق من صلاحية المستخدم (مثلاً polling أو صفحة مشتركة).

---

## 1) المشاكل التي تم إصلاحها مسبقاً

| المسار / الصفحة | المشكلة | الإصلاح |
|-----------------|---------|---------|
| `/api/procurement/po/waiting` | path كان SECTION_PROCUREMENT فقط، والـ Controller يسمح أيضاً SECTION_SALES و SUPPLIER_INVOICE_VIEW | V3: إضافة SECTION_SALES و SUPPLIER_INVOICE_VIEW لـ `/api/procurement/**` |
| `/api/sales/customer-requests` | الواجهة كانت تضيف الطلب عند SECTION_OPERATIONS بينما الـ API يقبل SECTION_SALES فقط | تعديل polling و ApprovalsInbox: استدعاء customer-requests فقط عند `SECTION_SALES` |
| `/api/suppliers/invoices` | path كان SECTION_PROCUREMENT فقط، والـ Controller يسمح SUPPLIER_INVOICE_VIEW و SECTION_FINANCE | V4: إضافة SUPPLIER_INVOICE_VIEW و SECTION_FINANCE لـ `/api/suppliers/**` |
| `/api/inventory/grn` | Controller غُيّر إلى WAREHOUSE_SECTION؛ path كان SECTION_PROCUREMENT فقط | تغيير الـ Controller إلى WAREHOUSE_SECTION؛ path يحتاج أيضاً SECTION_WAREHOUSE و SECTION_OPERATIONS و INVENTORY_VIEW (انظر V5) |

---

## 2) فجوات path_permission المتبقية (مقارنة @PreAuthorize مع الـ proposal)

الـ proposal يضع غالباً **صلاحية واحدة** لكل مسار، بينما الـ Controllers تستخدم تعابير مثل `X or Y or Z`. أي مستخدم لديه `Y` أو `Z` فقط سيمر من الـ Controller لكن يُرفض من **PathPermissionFilter** إن لم تكن `Y` و `Z` مضافتين في path_permission.

**مصدر الحقيقة:** أي `@PreAuthorize("A or B or C")` يجب أن يقابله ثلاث قواعد في path_permission لنفس المسار (أو patterns أدق)، وإلا **PathPermissionFilter** سيرفض الطلب قبل الوصول إلى الـ Controller.

| المسار | الـ Controller يسمح | path_permission (proposal) | المطلوب إضافته |
|--------|---------------------|----------------------------|-----------------|
| `/api/crm/**` | SECTION_CRM **or** SECTION_SALES | SECTION_CRM فقط | SECTION_SALES |
| `/api/units/**` | WAREHOUSE_SECTION **or** SUPPLIER_INVOICE_VIEW | SECTION_WAREHOUSE فقط | SUPPLIER_INVOICE_VIEW |
| `/api/inventory/**` | WAREHOUSE_SECTION، INVENTORY_ITEMS_ACCESS (وغيرها) تشمل SECTION_OPERATIONS، SUPPLIER_INVOICE_VIEW، INVENTORY_VIEW، MENU_OPERATIONS_* | SECTION_WAREHOUSE فقط | SECTION_OPERATIONS، SUPPLIER_INVOICE_VIEW، INVENTORY_VIEW |
| `/api/inventory/grn/**` | WAREHOUSE_SECTION (= SECTION_WAREHOUSE or SECTION_OPERATIONS or SECTION_PROCUREMENT or INVENTORY_VIEW) | SECTION_PROCUREMENT فقط | SECTION_WAREHOUSE، SECTION_OPERATIONS، INVENTORY_VIEW |

---

## 3) الواجهة — استدعاءات مشروطة

يجب أن تبقى أي استدعاءات لـ APIs حساسة للصلاحيات **مشروطة** بصلاحية المستخدم (من `user.permissions` في localStorage) حتى لا يُرسل طلب لمستخدم لا يملك الصلاحية (وبالتالي يقل 403 والرسائل المضللة).

**قاعدة ذهبية:** الـ **polling** و **dashboard widgets** و **quick cards** يجب أن تكون مشروطة بصلاحيات واضحة (مثلاً SECTION_SALES، SECTION_PROCUREMENT)، وليس "عمليات" أو "كل مصادق" بشكل عام — وإلا سيستمر ظهور 403 حتى لو الـ backend مضبوط، لأن الفرونت يطلق استدعاءات لا يحتاجها الدور.

| الملف | الحالة | ملاحظة |
|-------|--------|--------|
| `useNotificationPolling.ts` | ✅ معدّل | GRN: SECTION_PROCUREMENT أو SECTION_WAREHOUSE أو SECTION_OPERATIONS؛ PO waiting: SECTION_PROCUREMENT أو SECTION_SALES أو SUPPLIER_INVOICE_VIEW؛ customer-requests: SECTION_SALES فقط |
| `ApprovalsInbox.tsx` | ✅ معدّل | جلب طلبات العملاء فقط عند SECTION_SALES |
| صفحات أخرى (SupplierInvoicesPage، إلخ) | ⚠️ | الصفحة تُفتح حسب القائمة؛ إن فُتحت بدور لا يملك الصلاحية فالاعتماد على **path_permission** و @PreAuthorize في الـ backend. يُفضّل إخفاء عناصر القائمة حسب الصلاحيات (موجود عادةً) وعدم استدعاء APIs لا يملك المستخدم صلاحيتها. |

---

## 4) أفضل الممارسات (Least Privilege)

- **لا توسّع `/api/<module>/**` بدون قصد.**  
  إذا **endpoint واحد** فقط يحتاج صلاحية إضافية، ضع rule أدق للمسار بدل فتح كل الـ module:
  - مثال: بدل إضافة SECTION_SALES على `/api/procurement/**` بالكامل، يمكن لاحقاً استخدام:
    - `/api/procurement/po/waiting` → SECTION_SALES
    - والإبقاء على `/api/procurement/**` العام بـ SECTION_PROCUREMENT فقط.
- **مصدر الحقيقة:** تحقق دائماً من الـ **Controller** (@PreAuthorize): إذا السماح فقط على endpoint معين داخل الـ module، استخدم pattern أدق لهذا المسار.
- **بعد تطبيق migrations:** **لا تعدّل V3 / V4 / V5** بعد ما تنطبق. إذا احتجت تضييق أو تفصيل قواعد:
  - أنشئ **Migration جديد (مثلاً V6)** يضيف patterns أدق لمسارات محددة، أو
  - إذا لزم **إزالة** صلاحية من مسار عام، استخدم DELETE مدروس في migration جديد (بحذر).

---

## 5) إجراءات الإصلاح

1. **تشغيل الـ migrations**  
   التأكد من تطبيق V3، V4، و **V5** (يضيف القواعد الناقصة لـ CRM، units، inventory، inventory/grn).

2. **بعد تطبيق path_permission**  
   إعادة تشغيل الـ Backend لتحميل القواعد من قاعدة البيانات (PathPermissionService يحمّلها عند التشغيل).

3. **التحقق**  
   - تسجيل الدخول بأدوار مختلفة (مدير مالي، مشتريات، مبيعات، عمليات، إلخ).  
   - فتح الصفحات والتحقق من عدم ظهور 403 غير متوقعة.  
   - استخدام **GET /api/permissions/path-audit** (إن وُجد) لتدقيق التغطية.  

   **تمييز سبب 403 بسرعة:**  
   - **403 من PathPermissionFilter:** لا توجد rule للمسار، أو المستخدم لا يملك أي من الـ PermissionID المسموحة في القواعد المطابقة.  
   - **403 من @PreAuthorize:** توجد rule والطلب وصل للـ Controller، لكن المستخدم لا يملك الصلاحية الموجودة داخل تعبير الـ @PreAuthorize.  
   - **403 بسبب الفرونت (polling/صفحة):** الفرونت يستدعي endpointاً لا يفترض أن يستدعيه لهذا الدور — الحل: جعل الاستدعاء مشروطاً بالصلاحية في الواجهة (مثل polling و ApprovalsInbox).

4. **مراجعة دورية**  
   عند إضافة **Controller** جديد أو تغيير **@PreAuthorize** لاستخدام صلاحيات متعددة (A or B or C)، إضافة قواعد path_permission لـ B و C إن لم تكونا مغطاة، ويفضّل **patterns أدق** عندما الحاجة endpoint محدد فقط.

**خطوة عملية مباشرة بعد الخطة:** تشغيل V3 ثم V4 ثم V5، إعادة تشغيل الـ Backend، ثم التجربة بدور **مدير مالي (FM)**. إذا بقي 403 على `/api/procurement/po/waiting` أو `/api/sales/customer-requests` بعد تعديل الـ polling، فغالباً الاستدعاء يأتي من **صفحة أخرى** أو **guard ناقص** وليس من الـ backend.

---

## 6) خطوات تحقق سريعة (لتحديد سبب 403)

**A) التحقق من صلاحيات الدور**

```sql
SELECT p.PermissionCode
FROM rolepermissions rp
JOIN permissions p ON p.PermissionID = rp.PermissionID
WHERE rp.RoleID = :roleId AND rp.IsAllowed = 1;
```
(استبدل `:roleId` برقم الدور المعني.)

**B) التحقق من تغطية path_permission للمسار والصلاحية**

مثال لمسار الطلب `/api/inventory/grn` (مطابقة تقريبية: النمط `**` = أي ذيل):

```sql
SELECT pp.PathPattern, pp.HttpMethod, p.PermissionCode, pp.Priority
FROM path_permission pp
JOIN permissions p ON p.PermissionID = pp.PermissionID
WHERE pp.PathType = 'API'
  AND '/api/inventory/grn' LIKE REPLACE(pp.PathPattern, '**', '%')
ORDER BY pp.Priority DESC;
```
(المطابقة الدقيقة في التطبيق عبر AntPathMatcher؛ هذا الاستعلام تقريبي لمعرفة أي قواعد قد تغطي المسار.)

**C) بعد تعديل صلاحيات الدور**

1. احفظ الدور من شاشة الصلاحيات (كي يُنفَّذ `assignPermissions` ويُحسب الـ dependencies).  
2. **تسجيل خروج ثم دخول** للمستخدم (كي يُحدَّث الـ JWT/Session بالصلاحيات الجديدة).

---

## 7) ملخص الـ migrations

| Migration | المحتوى |
|-----------|---------|
| V3 | `/api/procurement/**`: SECTION_SALES، SUPPLIER_INVOICE_VIEW |
| V4 | `/api/suppliers/**`: SUPPLIER_INVOICE_VIEW، SECTION_FINANCE |
| V5 | `/api/crm/**`: SECTION_SALES؛ `/api/units/**`: SUPPLIER_INVOICE_VIEW؛ `/api/inventory/**`: SECTION_OPERATIONS، SUPPLIER_INVOICE_VIEW، INVENTORY_VIEW؛ `/api/inventory/grn/**`: SECTION_WAREHOUSE، SECTION_OPERATIONS، INVENTORY_VIEW |
| V6 | `/api/inventory/grn/**`: SECTION_PROCUREMENT (إكمال تطابق WAREHOUSE_SECTION في الـ Controller) |

---

## 8) مرجع سريع — أين تُخزَن الصلاحيات في الفرونت؟

- **المصدر:** `localStorage.getItem('user')` → `user.permissions` (مصفوفة رموز، مثل `SECTION_FINANCE`, `SUPPLIER_INVOICE_VIEW`).
- **متى تُحدَّث:** عند تسجيل الدخول (أو عند استدعاء `/auth/me` / refresh الـ token إذا كان التطبيق يحدّث كائن المستخدم من هناك).
- **التحقق:** `const has = (p: string) => (user?.permissions || []).includes(p);` ثم استدعاء الـ API فقط عند `has('SECTION_XXX')` حسب الحاجة.

---

## 9) حالة التنفيذ (مقارنة النظام بالمطلوب)

| البند | المطلوب (الخطة) | ما تم تنفيذه |
|-------|------------------|---------------|
| **path_permission — فجوات القسم 2** | إضافة SECTION_SALES لـ `/api/crm/**`، SUPPLIER_INVOICE_VIEW لـ `/api/units/**`، SECTION_OPERATIONS + SUPPLIER_INVOICE_VIEW + INVENTORY_VIEW لـ `/api/inventory/**`، SECTION_WAREHOUSE + SECTION_OPERATIONS + INVENTORY_VIEW لـ `/api/inventory/grn/**` | ✅ V5 يغطيها. إضافة V6 لـ SECTION_PROCUREMENT على `/api/inventory/grn/**` لإكمال تطابق WAREHOUSE_SECTION |
| **الواجهة — استدعاءات مشروطة (القسم 3)** | polling و ApprovalsInbox مشروطة بصلاحيات؛ customer-requests عند SECTION_SALES فقط | ✅ useNotificationPolling: GRN عند SECTION_PROCUREMENT أو SECTION_WAREHOUSE أو SECTION_OPERATIONS أو INVENTORY_VIEW؛ PO waiting عند SECTION_PROCUREMENT أو SECTION_SALES أو SUPPLIER_INVOICE_VIEW؛ customer-requests عند SECTION_SALES فقط. ✅ ApprovalsInbox يجلب طلبات العملاء فقط عند SECTION_SALES |
| **Migrations** | تشغيل V3، V4، V5 ثم إعادة تشغيل الـ Backend | ✅ V3، V4، V5، V6؛ بعد تطبيقها إعادة تشغيل الـ Backend لتحميل قواعد path_permission |
