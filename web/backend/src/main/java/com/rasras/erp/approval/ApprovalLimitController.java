package com.rasras.erp.approval;

import com.rasras.erp.approval.dto.ApprovalLimitDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approval-limits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApprovalLimitController {

    private final ApprovalLimitService approvalLimitService;

    @GetMapping
    public ResponseEntity<List<ApprovalLimitDto>> getAll(
            @RequestParam(required = false) String activityType) {
        return ResponseEntity.ok(approvalLimitService.getAllLimits(activityType));
    }

    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<ApprovalLimitDto>> getByRole(@PathVariable Integer roleId) {
        return ResponseEntity.ok(approvalLimitService.getLimitsByRole(roleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApprovalLimitDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(approvalLimitService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApprovalLimitDto> update(@PathVariable Integer id,
            @RequestBody ApprovalLimitDto dto) {
        return ResponseEntity.ok(approvalLimitService.updateLimit(id, dto));
    }
}
