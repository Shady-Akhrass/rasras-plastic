# Flyway: إصلاح checksum mismatch

إذا ظهر الخطأ:

```
Migration checksum mismatch for migration version 2
-> Applied to database : -478559832
-> Resolved locally    : 221955853
Either revert the changes to the migration, or run repair to update the schema history.
```

فالسبب أن ملف الـ migration (مثلاً `V2__permission_dependencies.sql`) تم تعديله **بعد** أن طُبّق على قاعدة البيانات. Flyway يتحقق من أن الملفات المطبقة لم تتغير.

**الحل:** تشغيل **repair** لتحديث الـ checksum في جدول `flyway_schema_history` ليطابق الملف الحالي. استخدم Maven Wrapper (مش `mvn` مباشرة):

```bash
cd "D:\Rasras Company\rasras-plastic\web\backend"
.\mvnw flyway:repair
```

إذا كانت بيانات الاتصال بقاعدة البيانات مختلفة (مثلاً كلمة مرور)، مرّر الخصائص:

```bash
.\mvnw flyway:repair -Dflyway.password=YOUR_PASSWORD
```

أو كامل الاتصال:

```bash
.\mvnw flyway:repair -Dflyway.url=jdbc:mysql://localhost:3306/rasrasplastics -Dflyway.user=root -Dflyway.password=YOUR_PASSWORD
```

بعد نجاح `repair` يمكن إعادة تشغيل التطبيق:

```bash
.\mvnw spring-boot:run
```

---

## متى تستخدم repair؟

✅ **استخدم `repair`** إذا:

- التعديل كان **تعليقات / ترتيب / تحسينات** بدون تغيير منطقي مؤثر على DB،  
  **أو**
- أنت متأكد أن حالة الـ DB تطابق الـ SQL الحالي (مثلاً نفذت التغييرات يدوياً مسبقاً).

في هذه الحالات repair يحدّث الـ checksum فقط ولا يطبّق أي SQL.

❌ **لا تستخدم repair** إذا:

- عدّلت أو أضفت أوامر `CREATE` أو `INSERT` (أو غيرها) بشكل فعلي وتتوقع أن Flyway يطبّقها.  
  **repair لا يطبّق أي شيء**، فقط يغيّر الـ checksum في سجل Flyway.

في هذه الحالة الأفضل: إضافة migration جديد (مثلاً `V3__وصف_التغيير.sql`) ووضع التغييرات هناك.
