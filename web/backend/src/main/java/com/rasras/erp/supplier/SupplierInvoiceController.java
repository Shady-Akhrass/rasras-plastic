package com.rasras.erp.supplier;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import com.rasras.erp.supplier.dto.SupplierInvoiceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.SUPPLIER_INVOICES)
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

    @PostMapping("/{id}/approve-payment")
    public ResponseEntity<ApiResponse<SupplierInvoiceDto>> approvePayment(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam boolean approved) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.approvePayment(id, userId, approved)));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Integer id) {
        byte[] pdf = invoiceService.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"invoice-" + id + ".pdf\"")
                .body(pdf);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Integer id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteInvoicePost(@PathVariable Integer id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
