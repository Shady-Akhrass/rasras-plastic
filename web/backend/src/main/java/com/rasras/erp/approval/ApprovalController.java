package com.rasras.erp.approval;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import com.rasras.erp.shared.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApprovalController {

    private final ApprovalService approvalService;

    /** قائمة الاعتمادات المعلقة — حسب دور المستخدم المسجّل: الأدمن يرى الكل، غيره يرى طلبات خطوة دوره فقط */
    @PreAuthorize(SecurityConstants.AUTHENTICATED)
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ApprovalRequestDto>>> getPendingRequests(
            @RequestParam(required = false) Integer userId) {
        Integer effectiveUserId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            effectiveUserId = principal.getId();
        }
        if (effectiveUserId == null && userId != null) {
            effectiveUserId = userId;
        }
        if (effectiveUserId == null) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }
        return ResponseEntity.ok(ApiResponse.success(approvalService.getPendingRequestsForUser(effectiveUserId)));
    }

    /** سجل الاعتمادات — بيانات حساسة، يتطلب صلاحية SECTION_MAIN أو أدوار الإشراف */
    @PreAuthorize(SecurityConstants.APPROVAL_ACTION)
    @GetMapping("/audit")
    public ResponseEntity<ApiResponse<List<ApprovalAuditDto>>> getRecentAudit(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getRecentApprovalActions(limit)));
    }

    /** تنفيذ اعتماد/رفض — فقط من له صلاحية الاعتماد؛ يُسجّل المستخدم المسجّل دخوله */
    @PreAuthorize(SecurityConstants.APPROVAL_ACTION)
    @PostMapping("/{id}/action")
    public ResponseEntity<ApiResponse<Void>> takeAction(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer userId,
            @RequestParam String action,
            @RequestParam(required = false) String comments,
            @RequestParam(required = false) Integer warehouseId) {
        Integer effectiveUserId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            effectiveUserId = principal.getId();
        }
        if (effectiveUserId == null && userId != null) {
            effectiveUserId = userId;
        }
        if (effectiveUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        approvalService.processAction(id, effectiveUserId, action, comments, warehouseId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
