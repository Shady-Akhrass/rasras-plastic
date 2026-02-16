package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalesInvoiceController {

    private final SalesInvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesInvoiceDto>>> getAllInvoices() {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesInvoiceDto>> getInvoiceById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalesInvoiceDto>> createInvoice(@RequestBody SalesInvoiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.createInvoice(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesInvoiceDto>> updateInvoice(
            @PathVariable Integer id,
            @RequestBody SalesInvoiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.updateInvoice(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Integer id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<SalesInvoiceDto>> submitForApproval(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.submitForApproval(id)));
    }
}
