package com.rasras.erp.supplier;

import com.rasras.erp.inventory.GRNService;
import com.rasras.erp.inventory.GoodsReceiptNoteDto;
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
public class SupplierInvoiceController {

    private final SupplierInvoiceService invoiceService;
    private final GRNService grnService;

    @GetMapping("/pending-grns")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_CREATE)
    public ResponseEntity<ApiResponse<List<GoodsReceiptNoteDto>>> getPendingGRNsForInvoicing() {
        return ResponseEntity.ok(ApiResponse.success(grnService.getCompletedGRNsNotInvoiced()));
    }

    @GetMapping("/grn/{grnId}")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_CREATE_OR_REVIEW)
    public ResponseEntity<ApiResponse<GoodsReceiptNoteDto>> getGRNForInvoice(@PathVariable Integer grnId) {
        return ResponseEntity.ok(ApiResponse.success(grnService.getGRNById(grnId)));
    }

    @GetMapping("/{id}/match-details")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_REVIEW)
    public ResponseEntity<ApiResponse<com.rasras.erp.supplier.dto.InvoiceMatchDetailsDto>> getMatchDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getMatchDetails(id)));
    }

    @GetMapping
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_VIEW)
    public ResponseEntity<ApiResponse<List<SupplierInvoiceDto>>> getAllInvoices() {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices()));
    }

    @GetMapping("/{id}")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_VIEW)
    public ResponseEntity<ApiResponse<SupplierInvoiceDto>> getInvoiceById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }

    @PostMapping
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_CREATE)
    public ResponseEntity<ApiResponse<SupplierInvoiceDto>> createInvoice(@RequestBody SupplierInvoiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.createInvoice(dto)));
    }

    @PostMapping("/{id}/approve-payment")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_APPROVE)
    public ResponseEntity<ApiResponse<SupplierInvoiceDto>> approvePayment(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam boolean approved) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.approvePayment(id, userId, approved)));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_VIEW)
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Integer id) {
        byte[] pdf = invoiceService.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"invoice-" + id + ".pdf\"")
                .body(pdf);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_CREATE)
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Integer id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/delete")
    @PreAuthorize(SecurityConstants.SUPPLIER_INVOICE_CREATE)
    public ResponseEntity<ApiResponse<Void>> deleteInvoicePost(@PathVariable Integer id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
