# دليل تبعيات الصلاحيات (Menu → API)

## الهدف

ربط صلاحيات القائمة (MENU_*) بصلاحيات الـ API (SECTION_* وغيرها) حتى لا يحصل المستخدم على 403 عند فتح صفحة تظهر له في القائمة.

- عند منح دور صلاحية قائمة (مثل `MENU_OPERATIONS_ITEMS`) يُمنح تلقائياً الصلاحيات المطلوبة للـ API (مثل `SECTION_WAREHOUSE`).
- الحل يعتمد على جدول **permission_dependencies** وحساب الإغلاق التعدي (transitive closure) عند تعيين صلاحيات الدور.

## الجدول permission_dependencies

| العمود | الوصف |
|--------|--------|
| permission_id | الصلاحية الممنوحة (مثل MENU_OPERATIONS_ITEMS) |
| requires_permission_id | الصلاحية المطلوبة إضافتها تلقائياً (مثل SECTION_WAREHOUSE) |

معنى السجل: عند منح `permission_id` لدور، يجب منح `requires_permission_id` أيضاً.

- **تضارب مقصود:** مثلاً `MENU_OPERATIONS_ITEMS` له تبعيتان: SECTION_OPERATIONS و SECTION_WAREHOUSE (لأن الصفحة تستدعي `/api/inventory/**`). هذا مقصود.
- **Migration:** السكربت مصمّم للتشغيل **مرة واحدة** عبر Flyway؛ إنشاء الفهارس في MySQL 5.5 غير idempotent (إعادة التشغيل تعطي Duplicate key name).

## أين يُحدَّث تعيين الصلاحيات؟

- **Controller:** `POST /api/roles/{id}/permissions` (Body: `{ "permissionIds": [1,2,...] }`).
- **Service:** `RoleService.assignPermissions(roleId, permissionIds)`.
- يتم حساب **الصلاحيات الفعالة** = المدخلات + إغلاق تبعياتها، ثم حفظ هذه المجموعة في `rolepermissions`.

## إضافة ربط قائمة → API جديد

1. **تأكد من وجود الصلاحيات في جدول `permissions`**  
   (مثلاً `MENU_XXX` و `SECTION_YYY` أو صلاحية فعل مثل `ACCOUNTING_VIEW`).

2. **أضف سطر تبعية في `permission_dependencies`:**

   ```sql
   INSERT INTO permission_dependencies (permission_id, requires_permission_id)
   SELECT p.PermissionID, r.PermissionID
   FROM permissions p
   INNER JOIN permissions r ON r.PermissionCode = 'SECTION_YYY'
   WHERE p.PermissionCode = 'MENU_XXX'
     AND NOT EXISTS (
       SELECT 1 FROM permission_dependencies pd
       WHERE pd.permission_id = p.PermissionID AND pd.requires_permission_id = r.PermissionID
     );
   ```

3. أو أضف سطراً في **migration** جديد (مثل `V3__...sql`) بنفس النمط إذا أردت versioned schema.

4. **التبعيات التعدية:** إذا كانت A تتطلب B و B تتطلب C، فمنح A يمنح تلقائياً B و C. لا حاجة لسطر A→C إلا للوضوح.

5. **الدوران (circular):** تجنّب A→B و B→A. الخدمة تحدّ عدد التكرارات (مثلاً 100) لتجنب حلقة لا نهائية.

## أمثلة من path_permission (للتوافق)

- `/api/inventory/**` → `SECTION_WAREHOUSE`
- `/api/finance/**` → `SECTION_FINANCE`
- `/api/employees/**`, `/api/hr/**` → `SECTION_EMPLOYEES`
- `/api/roles/**`, `/api/permissions/**`, `/api/settings/**` → `SECTION_SYSTEM`
- `/api/approvals/**` (غير pending) → `APPROVAL_ACTION`
- `/api/approvals/pending` GET → `BASE_ACCESS`

لذلك أي عنصر قائمة يفتح واجهات تحت هذه المسارات يجب أن يكون له تبعية للصلاحية المناسبة في `permission_dependencies`.

- عناصر العمليات/المستودع اللي بتضرب inventory: في الـ migration نستخدم نمط LIKE (`MENU_OPERATIONS_%` واسم يحتوي ITEM/CATEGOR/STOCK) لتغطية أسماء جديدة بدون إضافتها يدوياً. إن كان الـ naming غير ثابت، راجع التحذيرات عند التشغيل أو أضف قواعد صريحة.
- **False positives/negatives:** اسم قد يحتوي STOCK لكن الصفحة لا تستدعي `/api/inventory/**`، أو العكس (مثلاً MENU_OPERATIONS_MATERIALS تحتاج inventory واسمها لا يطابق النمط). الـ startup warning يساعد في اكتشاف الناقص؛ لا يكتشف تبعية خاطئة.
- **حالة الأحرف (case):** في MySQL عادة LIKE غير حساس حسب الـ collation؛ تغيير الـ collation قد يغيّر السلوك.

## فحص عند التشغيل (Startup check)

المكوّن `MenuPermissionDependencyStartupCheck` يتحقق من صلاحيات القائمة ويُسجّل رسائل **تشخيصية (ليست أخطاء)**. قد يكون طبيعي لبعض صفحات MAIN (dashboard، company GET، إلخ). لو المستخدم شاف منيو وبأول استدعاء API صار 403 → راجع dependency لهذا العنصر.

1. **بدون تبعية:** أي صلاحية `MENU_*` لا تملك أي سطر في `permission_dependencies` → WARNING مع عدد التبعيات (0). يساعد في اكتشاف غلط إملائي أو منيو جديد نُسِي ربطه.
2. **عدد التبعيات:** يُطبَع في كل رسالة (مثلاً "has N dependency(ies)").
3. **الإغلاق يصل فقط إلى BASE_ACCESS:** إن وُجدت تبعيات والإغلاق = {BASE_ACCESS} فقط → **INFO** (طبيعي لصفحات مثل dashboard/company).
4. **الإغلاق لا يحتوي أي صلاحية API:** إن وُجدت تبعيات لكن الإغلاق لا يحتوي SECTION_* ولا BASE_ACCESS ولا غيرها من "API-like" → WARNING تشخيصي مع تذكير "لو 403 عند فتح الصفحة → راجع dependency".

**صلاحيات "API-like" (قابلة للتوسعة):** يبدأ بـ `SECTION_*`، أو ضمن المجموعة الثابتة `BASE_ACCESS`, `APPROVAL_ACTION`, `FILE_UPLOAD`، أو يبدأ بأحد البادئات في `app.permission-dependency.api-prefixes` (مثلاً ACCOUNTING_, INVENTORY_, FINANCE_, PROCUREMENT_, SALES_, SUPPLIER_INVOICE_). يمكن توسعة القائمة من الإعدادات دون تغيير الكود.

## إصلاح 403 بعد تفعيل التبعيات (أدوار قديمة)

إذا كان الدور (مثل FM) قد حُفظت صلاحياته **قبل** تفعيل آلية التبعيات، فإن جدول `rolepermissions` يحتوي فقط الصلاحيات المختارة يدوياً (مثل MENU_*) دون الصلاحيات المحسوبة (SECTION_*). النتيجة: المستخدم يرى عناصر القائمة لكن يستقبل 403 من الـ API.

**الحل:** إعادة حفظ صلاحيات الدور مرة واحدة من صفحة الأدوار والصلاحيات:

1. الدخول إلى **إعدادات → الأدوار والصلاحيات**.
2. فتح الدور المعني (مثل «المدير المالي» FM).
3. عدم تغيير اختيارات الصلاحيات؛ فقط الضغط على **حفظ** (أو تحديث الصلاحيات ثم حفظ).
4. بهذا يُستدعى `assignPermissions` ويُحسب الإغلاق التعدي ويُحفظ في `rolepermissions` (مثلاً MENU_OPERATIONS_ITEMS → SECTION_WAREHOUSE و SECTION_OPERATIONS).
5. المستخدمون بهذا الدور يجب أن **يعيدوا تسجيل الدخول** ليُحدَّث الـ token بالصلاحيات الجديدة.

للتحقق: استخدم **GET /api/roles/{id}/effective-permissions** وتأكد من ظهور SECTION_* المناسبة مع MENU_*.

## نقطة التصحيح (Debug)

- **GET /api/roles/{id}/effective-permissions**  
  تُرجع الصلاحيات الفعالة للدور (رموز وأرقام)، أي ما تم حفظه بعد حساب التبعيات. مفيدة للتحقق من أن منح MENU_* أضاف SECTION_* المطلوب.

## الاختبارات

- **PermissionDependencyServiceTest:** وحدة لحساب الإغلاق التعدي والإزالة الآمنة والدوران.
- **RoleServicePermissionDependenciesTest:** عند استدعاء `assignPermissions` بصلاحية قائمة واحدة، يُحفظ في الـ DB الصلاحيات الفعالة (قائمة + تبعيات).
