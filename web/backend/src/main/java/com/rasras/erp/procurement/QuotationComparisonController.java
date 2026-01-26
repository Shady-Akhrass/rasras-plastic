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

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuotationComparisonDto>> updateComparison(
            @PathVariable Integer id,
            @RequestBody QuotationComparisonDto dto) {
        return ResponseEntity.ok(ApiResponse.success(comparisonService.updateComparison(id, dto)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<QuotationComparisonDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(comparisonService.submitForApproval(id)));
    }

    @PostMapping("/{id}/finance-review")
    public ResponseEntity<ApiResponse<QuotationComparisonDto>> financeReview(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam boolean approved,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success(comparisonService.financeReview(id, userId, approved, notes)));
    }

    @PostMapping("/{id}/management-approve")
    public ResponseEntity<ApiResponse<QuotationComparisonDto>> managementApprove(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam boolean approved,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success(comparisonService.managementApprove(id, userId, approved, notes)));
    }
}
