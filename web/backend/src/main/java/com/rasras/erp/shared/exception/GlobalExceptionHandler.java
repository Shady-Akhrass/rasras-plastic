package com.rasras.erp.shared.exception;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Bad credentials: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.error("Data integrity violation", ex);
        Throwable root = ex.getMostSpecificCause();
        String causeMsg = root != null ? root.getMessage() : "";
        String msg = resolveDataIntegrityMessage(causeMsg);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    /**
     * يحوّل رسالة سبب الخطأ (من قاعدة البيانات) إلى رسالة عربية مفهومة للمستخدم.
     * يجمع كل منطق مطابقة النصوص في مكان واحد ليسهل صيانته.
     */
    private String resolveDataIntegrityMessage(String causeMsg) {
        final String defaultMsg = "لا يمكن تنفيذ العملية - تحقق من صحة البيانات (التصنيف، الوحدة، الروابط)";
        if (causeMsg == null || causeMsg.isEmpty()) {
            return defaultMsg;
        }

        // للتبسيط، نعمل بنسخة lower-case عند البحث عن كلمات عامة
        String lower = causeMsg.toLowerCase();

        // تكرار/مفتاح فريد
        if (causeMsg.contains("Duplicate") || causeMsg.contains("UNIQUE")) {
            // صلاحيات الدور: تكرار (RoleID, PermissionID)
            if (lower.contains("rolepermission") || lower.contains("uq_rolepermission")) {
                return "صلاحية مكررة لهذا الدور - يرجى المحاولة مجدداً";
            }
            return "كود مكرر - يرجى المحاولة مجدداً";
        }

        // قيود المفاتيح الأجنبية
        if (lower.contains("foreign key") || lower.contains("constraintviolation")) {
            // حذف موظف: وجود مستخدم أو عملاء أو مستندات مبيعات مرتبطة به
            if (lower.contains("parent row") && (lower.contains("employee") || lower.contains("employees"))) {
                return "لا يمكن حذف الموظف لوجود مستخدم أو عملاء أو مستندات مبيعات مرتبطة به. قم بإزالة الربط أو حذف المستندات المرتبطة أولاً.";
            }
            // عملاء (إنشاء/تحديث: مندوب مبيعات غير صحيح)
            if (causeMsg.contains("FK_Customers_SalesRep") || causeMsg.contains("SalesRepID")) {
                return "مسؤول المبيعات غير صحيح - اختر موظفاً من القائمة أو اترك الحقل فارغاً";
            }
            if (causeMsg.contains("PriceListID") || (causeMsg.contains("FK") && causeMsg.contains("PriceList"))) {
                return "قائمة الأسعار غير صحيحة - اختر قائمة من القائمة أو اترك الحقل فارغاً";
            }
            if (lower.contains("customers") || causeMsg.contains("CustomerID")) {
                return "لا يمكن حذف العميل لوجود فواتير أو طلبات أو حركات مرتبطة به";
            }

            // أمر شراء: سندات استلام أو فواتير مرتبطة به
            if (isPurchaseOrderDeleteConstraint(causeMsg, lower)) {
                return "لا يمكن حذف أمر الشراء لوجود سندات استلام (GRN) أو فواتير مورد مرتبطة به. يرجى حذف المستندات المرتبطة أولاً.";
            }

            // إذن إضافة (GRN): مرتجعات شراء أو فواتير مورد مرتبطة به
            if (isGRNDeleteConstraint(causeMsg, lower)) {
                return "لا يمكن حذف إذن الإضافة لوجود فواتير مورد أو مرتجعات شراء مرتبطة به. يرجى حذف المستندات المرتبطة أولاً.";
            }

            // عروض أسعار (مشتريات/مبيعات) والجداول المرتبطة بها
            if (isQuotationConstraint(causeMsg, lower)) {
                return "لا يمكن حذف عرض السعر لوجود مقارنات عروض أو أوامر شراء مرتبطة به. يرجى حذف أو تعديل المستندات المرتبطة أولاً.";
            }

            // فاتورة مورد: سندات صرف أو مدفوعات مرتبطة
            if (isSupplierInvoiceDeleteConstraint(causeMsg, lower)) {
                return "لا يمكن حذف فاتورة المورد لوجود سندات صرف أو مدفوعات مرتبطة بها. يرجى حذف المستندات المرتبطة أولاً.";
            }

            // مرتجع شراء: حركات أو مستندات مرتبطة
            if (isPurchaseReturnDeleteConstraint(causeMsg, lower)) {
                return "لا يمكن حذف مرتجع الشراء لوجود مستندات أو حركات مرتبطة به. يرجى حذف المستندات المرتبطة أولاً.";
            }

            // أدوار وصلاحيات
            if (causeMsg.contains("ApproverRoleID") || lower.contains("approvalworkflowsteps")) {
                return "لا يمكن حذف الدور لأنه مستخدم في خطوات سير الموافقة. قم بإزالة الدور من سير العمل أولاً.";
            }
            if (lower.contains("approvallimits") || (lower.contains("requiresreviewby") && lower.contains("role"))) {
                return "لا يمكن حذف الدور لأنه مستخدم في حدود الموافقة. قم بتعديل حدود الموافقة أولاً.";
            }
            if (causeMsg.contains("RoleID")
                    || (lower.contains("role") && (lower.contains("users") || lower.contains("user")))) {
                return "لا يمكن حذف الدور لأنه مرتبط بمستخدمين. قم بتغيير دور المستخدمين أولاً.";
            }

            // قيود خاصة بالأصناف (Items): أي مفتاح أجنبي من نوع FK_XXX_Item
            if (causeMsg.contains("FK_") && causeMsg.contains("_Item")) {
                return "لا يمكن حذف الصنف لوجود مستندات أو حركات أخرى مرتبطة به (مثل عروض الأسعار، أوامر الشراء/البيع، قوائم الأسعار، حركات المخزون، ...). يرجى مراجعة المستندات المرتبطة أولاً.";
            }

            // أي قيد أجنبي آخر
            return "البيانات المرتبطة غير صحيحة - تحقق من الحقول المرتبطة (مندوب المبيعات، قائمة الأسعار، التصنيف، أو وحدة القياس)";
        }

        // حالات أخرى غير مغطاة
        return defaultMsg;
    }

    private boolean isPurchaseOrderDeleteConstraint(String causeMsg, String lower) {
        return causeMsg.contains("FK_GRN_PO")
                || causeMsg.contains("FK_GRNItems_POItem")
                || causeMsg.contains("FK_SI_PO")
                || (lower.contains("purchaseorders") && (lower.contains("goodsreceiptnotes")
                        || lower.contains("grnitems")
                        || lower.contains("supplierinvoices")));
    }

    private boolean isGRNDeleteConstraint(String causeMsg, String lower) {
        return causeMsg.contains("FK_PurchaseReturn_GRN")
                || causeMsg.contains("FK_PurchaseReturnItem_GRNItem")
                || causeMsg.contains("FK_SI_GRN")
                || causeMsg.contains("FK_SIItems_GRNItem")
                || causeMsg.contains("FK_Batch_GRNItem")
                || (lower.contains("goodsreceiptnotes") && (lower.contains("purchasereturns")
                        || lower.contains("supplierinvoices")
                        || lower.contains("supplierinvoiceitems")))
                || lower.contains("goodsreceiptnotes")
                || lower.contains("grnitems");
    }

    private boolean isQuotationConstraint(String causeMsg, String lower) {
        return causeMsg.contains("FK_QCDetails_Quotation")
                || causeMsg.contains("FK_QC_SelectedQuotation")
                || causeMsg.contains("FK_PO_Quotation")
                || lower.contains("supplierquotations")
                || lower.contains("quotationcomparisondetails")
                || lower.contains("quotationcomparisons")
                || lower.contains("purchaseorders");
    }

    private boolean isSupplierInvoiceDeleteConstraint(String causeMsg, String lower) {
        return lower.contains("supplierinvoices")
                || lower.contains("supplierinvoiceitems")
                || (causeMsg.contains("FK_") && (causeMsg.contains("SupplierInvoice") || causeMsg.contains("SI_")));
    }

    private boolean isPurchaseReturnDeleteConstraint(String causeMsg, String lower) {
        return lower.contains("purchasereturns")
                || lower.contains("purchasereturnitems")
                || (causeMsg.contains("FK_") && (causeMsg.contains("PurchaseReturn") || causeMsg.contains("Return")));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String msg = "تنسيق الطلب غير صحيح - تأكد من إرسال permissionIds كمصفوفة أعداد صحيحة";
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        String msg = ex.getMessage();
        String displayMsg = (msg != null && !msg.isEmpty())
                ? ("An unexpected error occurred: " + msg)
                : "An unexpected error occurred";
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(displayMsg));
    }
}
