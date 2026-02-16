package com.rasras.erp.approval;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ApprovalRequestDto>>> getPendingRequests(@RequestParam Integer userId) {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getPendingRequestsForUser(userId)));
    }

    /** سجل الاعتمادات — بيانات حساسة، يتطلب صلاحية SECTION_MAIN أو أدوار الإشراف */
    @PreAuthorize("hasAnyRole('ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM', 'FM', 'ACC') or hasAuthority('SECTION_MAIN')")
    @GetMapping("/audit")
    public ResponseEntity<ApiResponse<List<ApprovalAuditDto>>> getRecentAudit(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getRecentApprovalActions(limit)));
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<ApiResponse<Void>> takeAction(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam String action,
            @RequestParam(required = false) String comments,
            @RequestParam(required = false) Integer warehouseId) {
        approvalService.processAction(id, userId, action, comments, warehouseId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
