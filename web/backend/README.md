# دليل تشغيل نظام RasRas Plastics ERP - Backend

## المتطلبات الأساسية

قبل تشغيل النظام، تأكد من تثبيت المتطلبات التالية:

1. **Java Development Kit (JDK) 17** أو أحدث
   - تحقق من التثبيت: `java -version`
   - يجب أن يكون الإصدار 17 أو أحدث

2. **Apache Maven 3.6+** (اختياري - يوجد Maven Wrapper في المشروع)
   - تحقق من التثبيت: `mvn -version`
   - أو استخدم `mvnw` الموجود في المشروع

3. **MySQL Server 8.0+**
   - يجب أن يكون MySQL قيد التشغيل
   - يجب إنشاء قاعدة البيانات `rasrasplastics`

## إعداد قاعدة البيانات

1. **تشغيل MySQL Server**

2. **إنشاء قاعدة البيانات:**
   ```sql
   CREATE DATABASE rasrasplastics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **تحديث إعدادات الاتصال** في ملف `src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/rasrasplastics?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
       username: root
       password: your_password_here  # ضع كلمة مرور MySQL هنا
   ```

## طرق التشغيل

### الطريقة 1: استخدام Maven Wrapper (موصى بها)

#### على Windows:
```bash
cd web/backend
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

#### على Linux/Mac:
```bash
cd web/backend
./mvnw clean install
./mvnw spring-boot:run
```

### الطريقة 2: استخدام Maven المثبت محلياً

```bash
cd web/backend
mvn clean install
mvn spring-boot:run
```

### الطريقة 3: تشغيل JAR ملف مباشرة

بعد بناء المشروع:
```bash
cd web/backend
mvn clean package
java -jar target/erp-1.0.0-SNAPSHOT.jar
```

## التحقق من التشغيل

بعد تشغيل التطبيق بنجاح، يجب أن ترى رسائل في الكونسول تشير إلى:
- بدء تشغيل Spring Boot
- الاتصال بقاعدة البيانات
- بدء الخادم على المنفذ 8080

### الوصول إلى التطبيق:

- **API Base URL:** `http://localhost:8080/api`
- **Swagger UI:** `http://localhost:8080/api/swagger-ui.html`
- **API Documentation:** `http://localhost:8080/api/api-docs`

## إعدادات الخادم

- **المنفذ:** 8080
- **Context Path:** `/api`
- **قاعدة البيانات:** MySQL على `localhost:3306`
- **اسم قاعدة البيانات:** `rasrasplastics`

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات:
- تأكد من تشغيل MySQL
- تحقق من اسم المستخدم وكلمة المرور في `application.yml`
- تأكد من وجود قاعدة البيانات `rasrasplastics`

### خطأ في المنفذ 8080:
- إذا كان المنفذ 8080 مستخدماً، يمكن تغييره في `application.yml`:
  ```yaml
  server:
    port: 8081  # أو أي منفذ آخر
  ```

### مشاكل في Java:
- تأكد من تثبيت JDK 17 أو أحدث
- تحقق من متغير البيئة `JAVA_HOME`

## الملفات المهمة

- `pom.xml` - ملف إعدادات Maven والتبعيات
- `src/main/resources/application.yml` - ملف إعدادات التطبيق
- `src/main/java/com/rasras/erp/RasrasErpApplication.java` - نقطة بدء التطبيق
- `mvnw` / `mvnw.cmd` - Maven Wrapper للبناء بدون تثبيت Maven

## ملاحظات إضافية

- التطبيق يستخدم Spring Boot 3.2.1
- يستخدم JWT للمصادقة
- يدعم Swagger/OpenAPI للتوثيق التفاعلي
- يستخدم Spring Modulith للهندسة المعمارية النمطية
