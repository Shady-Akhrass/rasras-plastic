package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/issue-notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockIssueNoteController {

    private final StockIssueNoteService issueNoteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockIssueNoteDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(issueNoteService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(issueNoteService.getById(id)));
    }

    @GetMapping("/by-order/{salesOrderId}")
    public ResponseEntity<ApiResponse<List<StockIssueNoteDto>>> getBySalesOrderId(@PathVariable Integer salesOrderId) {
        return ResponseEntity.ok(ApiResponse.success(issueNoteService.getBySalesOrderId(salesOrderId)));
    }

    @GetMapping("/check-stock")
    public ResponseEntity<ApiResponse<List<StockAvailabilityWarningDto>>> checkStockAvailability(
            @RequestParam Integer salesOrderId,
            @RequestParam Integer warehouseId) {
        return ResponseEntity.ok(ApiResponse.success(
                issueNoteService.checkStockAvailability(salesOrderId, warehouseId)));
    }

    @PostMapping("/from-order/{salesOrderId}")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> createFromSalesOrder(
            @PathVariable Integer salesOrderId,
            @RequestParam Integer warehouseId,
            @RequestParam(required = false) Integer issuedByUserId) {
        return ResponseEntity.ok(ApiResponse.success(
                issueNoteService.createFromSalesOrder(salesOrderId, warehouseId, issuedByUserId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> create(@RequestBody StockIssueNoteDto dto) {
        return ResponseEntity.ok(ApiResponse.success(issueNoteService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> update(
            @PathVariable Integer id,
            @RequestBody StockIssueNoteDto dto) {
        return ResponseEntity.ok(ApiResponse.success(issueNoteService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        issueNoteService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> approve(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer approvedByUserId) {
        return ResponseEntity.ok(ApiResponse.success(issueNoteService.approve(id, approvedByUserId)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(issueNoteService.submitForApproval(id)));
    }
}
