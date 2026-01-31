package com.rasras.erp.inventory;

import com.rasras.erp.sales.StockAvailabilityWarningDto;
import com.rasras.erp.sales.StockIssueNoteDto;
import com.rasras.erp.sales.StockIssueNoteService;
import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for Material Issue (إذن صرف) under inventory context.
 * Delegates to {@link StockIssueNoteService} which manages stockissuenotes.
 */
@RestController
@RequestMapping("/inventory/material-issues")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaterialIssueController {

    private final StockIssueNoteService stockIssueNoteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockIssueNoteDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(stockIssueNoteService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(stockIssueNoteService.getById(id)));
    }

    @GetMapping("/by-order/{salesOrderId}")
    public ResponseEntity<ApiResponse<List<StockIssueNoteDto>>> getBySalesOrderId(@PathVariable Integer salesOrderId) {
        return ResponseEntity.ok(ApiResponse.success(stockIssueNoteService.getBySalesOrderId(salesOrderId)));
    }

    @GetMapping("/check-stock")
    public ResponseEntity<ApiResponse<List<StockAvailabilityWarningDto>>> checkStockAvailability(
            @RequestParam Integer salesOrderId,
            @RequestParam Integer warehouseId) {
        return ResponseEntity.ok(ApiResponse.success(
                stockIssueNoteService.checkStockAvailability(salesOrderId, warehouseId)));
    }

    @PostMapping("/from-order/{salesOrderId}")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> createFromSalesOrder(
            @PathVariable Integer salesOrderId,
            @RequestParam Integer warehouseId,
            @RequestParam(required = false) Integer issuedByUserId) {
        return ResponseEntity.ok(ApiResponse.success(
                stockIssueNoteService.createFromSalesOrder(salesOrderId, warehouseId, issuedByUserId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> create(@RequestBody StockIssueNoteDto dto) {
        return ResponseEntity.ok(ApiResponse.success(stockIssueNoteService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> update(
            @PathVariable Integer id,
            @RequestBody StockIssueNoteDto dto) {
        return ResponseEntity.ok(ApiResponse.success(stockIssueNoteService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        stockIssueNoteService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<ApiResponse<StockIssueNoteDto>> finalize(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(ApiResponse.success(
                stockIssueNoteService.approve(id, userId)));
    }
}
