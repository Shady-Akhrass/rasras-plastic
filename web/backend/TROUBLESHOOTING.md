# حل مشاكل التشغيل

## المشكلة: AccessDeniedException في Maven

إذا ظهرت رسالة خطأ:
```
java.nio.file.AccessDeniedException: C:\Users\...\.m2\repository\...
```

### الحل 1: تشغيل PowerShell كمسؤول
1. ابحث عن PowerShell في قائمة Start
2. انقر بالزر الأيمن واختر "Run as administrator"
3. انتقل لمجلد المشروع:
   ```powershell
   cd "d:\شركة رصرص\rasras-plastic\web\backend"
   ```
4. شغّل التطبيق:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

### الحل 2: إصلاح صلاحيات مجلد Maven
```powershell
# امنح الصلاحيات الكاملة لمجلد Maven
icacls "C:\Users\ِAL\.m2" /grant "${env:USERNAME}:(OI)(CI)F" /T
```

### الحل 3: تشغيل من JAR مباشرة
إذا كان JAR موجود:
```powershell
cd "d:\شركة رصرص\rasras-plastic\web\backend"
java -jar target\erp-1.0.0-SNAPSHOT.jar
```

### الحل 4: استخدام Maven المثبت محلياً
إذا كان Maven مثبت:
```powershell
cd "d:\شركة رصرص\rasras-plastic\web\backend"
mvn spring-boot:run
```

## مشكلة المسار مع الأحرف العربية

إذا ظهرت مشاكل في المسار بسبب الأحرف العربية، استخدم المسار الكامل:
```powershell
Set-Location -LiteralPath "d:\شركة رصرص\rasras-plastic\web\backend"
```

## التحقق من حالة التطبيق

بعد التشغيل، انتظر 20-30 ثانية ثم:
```powershell
# تحقق من المنفذ
Get-NetTCPConnection -LocalPort 8080

# أو افتح المتصفح على:
# http://localhost:8080/api/swagger-ui.html
```
