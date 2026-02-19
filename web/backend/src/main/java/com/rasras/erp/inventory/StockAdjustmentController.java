package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * API لجرد المخزون وتقرير الفروقات
 */
@RestController
@RequestMapping("/inventory/adjustments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.WAREHOUSE_SECTION)
public class StockAdjustmentController {

    private final StockAdjustmentService adjustmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockAdjustmentDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(adjustmentService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockAdjustmentDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(adjustmentService.getById(id)));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<List<StockAdjustmentDto>>> getByWarehouse(@PathVariable Integer warehouseId) {
        return ResponseEntity.ok(ApiResponse.success(adjustmentService.getByWarehouse(warehouseId)));
    }

    @PostMapping("/count")
    public ResponseEntity<ApiResponse<StockAdjustmentDto>> createCount(
            @RequestParam Integer warehouseId,
            @RequestParam String countType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime countDate,
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(ApiResponse.success(
                adjustmentService.createCount(warehouseId, countType, countDate, userId)));
    }

    @PutMapping("/{id}/items")
    public ResponseEntity<ApiResponse<StockAdjustmentDto>> updateCountItems(
            @PathVariable Integer id,
            @RequestBody List<StockAdjustmentItemDto> items,
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(ApiResponse.success(
                adjustmentService.updateCountItems(id, items, userId)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<StockAdjustmentDto>> approve(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(ApiResponse.success(adjustmentService.approve(id, userId)));
    }

    @GetMapping("/variance-report")
    public ResponseEntity<ApiResponse<List<StockAdjustmentDto>>> getVarianceReport() {
        return ResponseEntity.ok(ApiResponse.success(adjustmentService.getApprovedForVarianceReport()));
    }
}
