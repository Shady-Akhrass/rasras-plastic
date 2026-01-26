package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/quotations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalesQuotationController {

    private final SalesQuotationService quotationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesQuotationDto>>> getAllQuotations() {
        return ResponseEntity.ok(ApiResponse.success(quotationService.getAllQuotations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesQuotationDto>> getQuotationById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.getQuotationById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalesQuotationDto>> createQuotation(@RequestBody SalesQuotationDto dto) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.createQuotation(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesQuotationDto>> updateQuotation(
            @PathVariable Integer id,
            @RequestBody SalesQuotationDto dto) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.updateQuotation(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuotation(@PathVariable Integer id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/convert-to-order")
    public ResponseEntity<ApiResponse<SalesQuotationDto>> convertToSalesOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.convertToSalesOrder(id)));
    }
}
