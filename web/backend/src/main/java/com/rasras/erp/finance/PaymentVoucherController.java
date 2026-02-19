package com.rasras.erp.finance;

import com.rasras.erp.finance.dto.InvoiceComparisonData;
import com.rasras.erp.finance.dto.PaymentVoucherDto;
import com.rasras.erp.finance.dto.SupplierWithInvoices;
import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/finance/payment-vouchers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.FINANCE_SECTION)
public class PaymentVoucherController {

    private final PaymentVoucherService voucherService;
    private final PaymentVoucherPdfService pdfService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentVoucherDto>>> getAllVouchers() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getAllVouchers()));
    }

    @GetMapping("/suppliers-with-pending-invoices")
    public ResponseEntity<ApiResponse<List<SupplierWithInvoices>>> getSuppliersWithPendingInvoices() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getSuppliersWithPendingInvoices()));
    }

    @GetMapping("/invoice-comparison/{supplierId}")
    public ResponseEntity<ApiResponse<List<InvoiceComparisonData>>> getInvoiceComparison(
            @PathVariable Integer supplierId) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getInvoiceComparison(supplierId)));
    }

    @GetMapping("/unpaid-invoices")
    public ResponseEntity<ApiResponse<List<InvoiceComparisonData>>> getUnpaidInvoices() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getUnpaidInvoices()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentVoucherDto>> getVoucherById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getVoucherById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentVoucherDto>> createVoucher(@RequestBody PaymentVoucherDto voucherDto) {
        return ResponseEntity
                .ok(ApiResponse.success("Payment voucher created successfully",
                        voucherService.createVoucher(voucherDto)));
    }

    @PostMapping("/{id}/approve-finance")
    public ResponseEntity<ApiResponse<PaymentVoucherDto>> approveFinanceManager(
            @PathVariable Integer id,
            @RequestParam String approvedBy) {
        return ResponseEntity.ok(ApiResponse.success("Approved by Finance Manager",
                voucherService.approveFinanceManager(id, approvedBy)));
    }

    @PostMapping("/{id}/approve-general")
    public ResponseEntity<ApiResponse<PaymentVoucherDto>> approveGeneralManager(
            @PathVariable Integer id,
            @RequestParam String approvedBy) {
        return ResponseEntity.ok(ApiResponse.success("Approved by General Manager",
                voucherService.approveGeneralManager(id, approvedBy)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PaymentVoucherDto>> rejectVoucher(
            @PathVariable Integer id,
            @RequestParam String rejectedBy,
            @RequestParam String reason) {
        return ResponseEntity.ok(
                ApiResponse.success("Payment voucher rejected", voucherService.rejectVoucher(id, rejectedBy, reason)));
    }

    @PostMapping("/{id}/process-payment")
    public ResponseEntity<ApiResponse<PaymentVoucherDto>> processPayment(
            @PathVariable Integer id,
            @RequestParam String paidBy) {
        return ResponseEntity
                .ok(ApiResponse.success("Payment processed successfully", voucherService.processPayment(id, paidBy)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PaymentVoucherDto>> cancelVoucher(
            @PathVariable Integer id,
            @RequestParam String cancelledBy,
            @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success("Payment voucher cancelled",
                voucherService.cancelVoucher(id, cancelledBy, reason)));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadVoucherPdf(@PathVariable Integer id) {
        PaymentVoucherDto voucher = voucherService.getVoucherById(id);
        byte[] pdfContents = pdfService.generateVoucherPdf(voucher);

        String fileName = "PaymentVoucher_" + voucher.getVoucherNumber() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContents);
    }
}
