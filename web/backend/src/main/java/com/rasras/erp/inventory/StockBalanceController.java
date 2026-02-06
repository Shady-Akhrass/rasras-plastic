package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockBalanceController {

    private final StockBalanceService stockService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockBalanceDto>>> getAllBalances() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getAllBalances()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockBalanceDto>> getBalanceById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(stockService.getBalanceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockBalanceDto>> createBalance(@RequestBody StockBalanceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(stockService.createBalance(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StockBalanceDto>> updateBalance(@PathVariable Integer id,
            @RequestBody StockBalanceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(stockService.updateBalance(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBalance(@PathVariable Integer id) {
        stockService.deleteBalance(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/reports/periodic")
    public ResponseEntity<ApiResponse<java.util.List<PeriodicInventoryReportDto>>> getPeriodicReport(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(required = false) Integer warehouseId) {
        return ResponseEntity.ok(ApiResponse.success(stockService.getPeriodicReport(month, year, warehouseId)));
    }
}
