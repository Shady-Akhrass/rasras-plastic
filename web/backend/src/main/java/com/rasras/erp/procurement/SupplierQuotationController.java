package com.rasras.erp.procurement;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procurement/quotation")
@RequiredArgsConstructor
public class SupplierQuotationController {

    private final SupplierQuotationService quotationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierQuotationDto>>> getAllQuotations() {
        return ResponseEntity.ok(ApiResponse.success(quotationService.getAllQuotations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierQuotationDto>> getQuotationById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.getQuotationById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierQuotationDto>> createQuotation(@RequestBody SupplierQuotationDto dto) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.createQuotation(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierQuotationDto>> updateQuotation(
            @PathVariable Integer id,
            @RequestBody SupplierQuotationDto dto) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.updateQuotation(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuotation(@PathVariable Integer id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteQuotationPost(@PathVariable Integer id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
