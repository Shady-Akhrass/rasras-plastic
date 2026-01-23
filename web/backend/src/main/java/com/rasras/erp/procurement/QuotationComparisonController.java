package com.rasras.erp.procurement;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procurement/comparison")
@RequiredArgsConstructor
public class QuotationComparisonController {

    private final QuotationComparisonService comparisonService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuotationComparisonDto>>> getAllComparisons() {
        return ResponseEntity.ok(ApiResponse.success(comparisonService.getAllComparisons()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuotationComparisonDto>> getComparisonById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(comparisonService.getComparisonById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuotationComparisonDto>> createComparison(
            @RequestBody QuotationComparisonDto dto) {
        return ResponseEntity.ok(ApiResponse.success(comparisonService.createComparison(dto)));
    }
}
