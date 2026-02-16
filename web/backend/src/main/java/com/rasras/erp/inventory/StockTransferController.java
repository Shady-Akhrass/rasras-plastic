package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for Stock Transfer (إذن تحويل بين مخازن).
 * Base path: /inventory/transfers
 */
@RestController
@RequestMapping("/inventory/transfers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockTransferController {

    private final StockTransferService stockTransferService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockTransferDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(stockTransferService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockTransferDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(stockTransferService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockTransferDto>> create(@RequestBody StockTransferDto dto) {
        return ResponseEntity.ok(ApiResponse.success(stockTransferService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StockTransferDto>> update(
            @PathVariable Integer id,
            @RequestBody StockTransferDto dto) {
        return ResponseEntity.ok(ApiResponse.success(stockTransferService.update(id, dto)));
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<ApiResponse<StockTransferDto>> finalize(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(ApiResponse.success(stockTransferService.finalizeTransfer(id, userId)));
    }
}
