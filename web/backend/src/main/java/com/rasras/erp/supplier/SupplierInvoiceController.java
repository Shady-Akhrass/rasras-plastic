package com.rasras.erp.supplier;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.supplier.dto.SupplierInvoiceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierInvoiceController {

    private final SupplierInvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierInvoiceDto>>> getAllInvoices() {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierInvoiceDto>> getInvoiceById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierInvoiceDto>> createInvoice(@RequestBody SupplierInvoiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.createInvoice(dto)));
    }
}
