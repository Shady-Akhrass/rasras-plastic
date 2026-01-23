# دليل التشغيل السريع - Backend

## الخطوات خطوة بخطوة

### الخطوة 1: التحقق من Java
افتح PowerShell واكتب:
```powershell
java -version
```
يجب أن ترى إصدار Java 17 أو أحدث.

### الخطوة 2: التحقق من MySQL
تأكد من أن MySQL قيد التشغيل:
```powershell
Get-Process -Name mysqld -ErrorAction SilentlyContinue
```

إذا لم يكن قيد التشغيل، شغّله من Services أو من Command Prompt:
```powershell
# أو من Command Prompt كمسؤول:
net start MySQL80
```

### الخطوة 3: إنشاء قاعدة البيانات (إذا لم تكن موجودة)
افتح MySQL Command Line أو MySQL Workbench واكتب:
```sql
CREATE DATABASE IF NOT EXISTS rasrasplastics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### الخطوة 4: تحديث إعدادات قاعدة البيانات
افتح الملف: `web\backend\src\main\resources\application.yml`

وتأكد من:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rasrasplastics?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: your_password_here  # ضع كلمة مرور MySQL هنا
```

### الخطوة 5: الانتقال إلى مجلد Backend
```powershell
cd "d:\شركة رصرص\rasras-plastic\web\backend"
```

### الخطوة 6: بناء المشروع (اختياري - إذا لم يكن مبني)
```powershell
.\mvnw.cmd clean package -DskipTests
```

### الخطوة 7: تشغيل التطبيق
```powershell
.\mvnw.cmd spring-boot:run
```

أو إذا كان لديك Maven مثبت:
```powershell
mvn spring-boot:run
```

### الخطوة 8: التحقق من التشغيل
بعد أن ترى رسالة "Started RasrasErpApplication" في الكونسول، افتح المتصفح على:
- **API:** http://localhost:8080/api
- **Swagger UI:** http://localhost:8080/api/swagger-ui.html

---

## استخدام السكربتات (أسهل طريقة)

بدلاً من الخطوات أعلاه، يمكنك استخدام السكربتات:

### تشغيل الباك اند:
```powershell
cd "d:\شركة رصرص\rasras-plastic"
.\scripts\run-backend.ps1
```

### إيقاف الباك اند:
```powershell
.\scripts\stop-backend.ps1
```

### فحص حالة الباك اند:
```powershell
.\scripts\check-backend.ps1
```

### بناء المشروع فقط:
```powershell
.\scripts\build-backend.ps1
```

---

## استكشاف الأخطاء

### خطأ: "Port 8080 already in use"
إذا كان المنفذ 8080 مستخدماً:
```powershell
# ابحث عن العملية التي تستخدم المنفذ:
Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess

# أو أوقف العملية:
.\scripts\stop-backend.ps1
```

### خطأ: "Cannot connect to MySQL"
- تأكد من أن MySQL قيد التشغيل
- تحقق من اسم المستخدم وكلمة المرور في `application.yml`
- تأكد من وجود قاعدة البيانات `rasrasplastics`

### خطأ: "Java not found"
- تأكد من تثبيت JDK 17 أو أحدث
- تحقق من متغير البيئة `JAVA_HOME`

---

## ملاحظات

- اضغط `Ctrl+C` في التيرمينال لإيقاف التطبيق
- التطبيق يعمل على المنفذ 8080
- Context Path هو `/api` - جميع الـ endpoints تبدأ بـ `/api`
