package com.rasras.erp.approval;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ApprovalRequest>>> getPendingRequests(@RequestParam Integer userId) {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getPendingRequestsForUser(userId)));
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<ApiResponse<Void>> takeAction(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam String action,
            @RequestParam(required = false) String comments) {
        approvalService.processAction(id, userId, action, comments);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
