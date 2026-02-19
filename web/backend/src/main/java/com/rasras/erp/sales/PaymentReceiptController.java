package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/receipts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.SALES_SECTION)
public class PaymentReceiptController {

    private final PaymentReceiptService receiptService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentReceiptDto>>> getAllReceipts() {
        return ResponseEntity.ok(ApiResponse.success(receiptService.getAllReceipts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentReceiptDto>> getReceiptById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(receiptService.getReceiptById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentReceiptDto>> createReceipt(@RequestBody PaymentReceiptDto dto) {
        return ResponseEntity.ok(ApiResponse.success(receiptService.createReceipt(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentReceiptDto>> updateReceipt(
            @PathVariable Integer id,
            @RequestBody PaymentReceiptDto dto) {
        return ResponseEntity.ok(ApiResponse.success(receiptService.updateReceipt(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReceipt(@PathVariable Integer id) {
        receiptService.deleteReceipt(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<PaymentReceiptDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(receiptService.submitForApproval(id)));
    }
}
