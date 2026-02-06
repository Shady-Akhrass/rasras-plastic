package com.rasras.erp.shared.exception;

import com.rasras.erp.shared.dto.ApiResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        Throwable root = ex.getMostSpecificCause();
        String causeMsg = root != null ? root.getMessage() : "";
        String msg = "لا يمكن تنفيذ العملية - تحقق من صحة البيانات (التصنيف، الوحدة، الروابط)";
        if (causeMsg.contains("Duplicate") || causeMsg.contains("UNIQUE")) {
            msg = "كود مكرر - يرجى المحاولة مجدداً";
        } else if (causeMsg.contains("foreign key") || causeMsg.contains("ConstraintViolation")) {
            if (causeMsg.contains("FK_Customers_SalesRep") || causeMsg.contains("SalesRepID"))
                msg = "مسؤول المبيعات غير صحيح - اختر موظفاً من القائمة أو اترك الحقل فارغاً";
            else if (causeMsg.contains("PriceListID") || (causeMsg.contains("FK") && causeMsg.contains("PriceList")))
                msg = "قائمة الأسعار غير صحيحة - اختر قائمة من القائمة أو اترك الحقل فارغاً";
            else if (causeMsg.contains("customers") || causeMsg.contains("CustomerID"))
                msg = "لا يمكن حذف العميل لوجود فواتير أو طلبات أو حركات مرتبطة به";
            else if (causeMsg.contains("ApproverRoleID") || causeMsg.contains("approvalworkflowsteps"))
                msg = "لا يمكن حذف الدور لأنه مستخدم في خطوات سير الموافقة. قم بإزالة الدور من سير العمل أولاً.";
            else if (causeMsg.contains("approvallimits") || (causeMsg.contains("RequiresReviewBy") && causeMsg.contains("role")))
                msg = "لا يمكن حذف الدور لأنه مستخدم في حدود الموافقة. قم بتعديل حدود الموافقة أولاً.";
            else if (causeMsg.contains("RoleID") || (causeMsg.contains("role") && (causeMsg.contains("users") || causeMsg.contains("user"))))
                msg = "لا يمكن حذف الدور لأنه مرتبط بمستخدمين. قم بتغيير دور المستخدمين أولاً.";
            else
                msg = "البيانات المرتبطة غير صحيحة - تحقق من الحقول المرتبطة (مندوب المبيعات، قائمة الأسعار، التصنيف، أو وحدة القياس)";
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
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
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred: " + ex.getMessage()));
    }
}
