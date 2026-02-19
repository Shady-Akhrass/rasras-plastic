package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/delivery-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.SALES_SECTION)
public class DeliveryOrderController {

    private final DeliveryOrderService deliveryOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeliveryOrderDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(deliveryOrderService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryOrderDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(deliveryOrderService.getById(id)));
    }

    @GetMapping("/by-issue-note/{issueNoteId}")
    public ResponseEntity<ApiResponse<List<DeliveryOrderDto>>> getByIssueNoteId(@PathVariable Integer issueNoteId) {
        return ResponseEntity.ok(ApiResponse.success(deliveryOrderService.getByIssueNoteId(issueNoteId)));
    }

    @PostMapping("/from-issue-note/{issueNoteId}")
    public ResponseEntity<ApiResponse<DeliveryOrderDto>> createFromIssueNote(
            @PathVariable Integer issueNoteId,
            @RequestParam(required = false) Integer createdByUserId) {
        return ResponseEntity.ok(ApiResponse.success(
                deliveryOrderService.createFromIssueNote(issueNoteId, createdByUserId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryOrderDto>> create(@RequestBody DeliveryOrderDto dto) {
        return ResponseEntity.ok(ApiResponse.success(deliveryOrderService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryOrderDto>> update(
            @PathVariable Integer id,
            @RequestBody DeliveryOrderDto dto) {
        return ResponseEntity.ok(ApiResponse.success(deliveryOrderService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        deliveryOrderService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<DeliveryOrderDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(deliveryOrderService.submitForApproval(id)));
    }
}
