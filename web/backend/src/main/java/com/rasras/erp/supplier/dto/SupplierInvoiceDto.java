package com.rasras.erp.supplier.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierInvoiceDto {
    private Integer id;
    private String invoiceNumber;
    private String supplierInvoiceNo;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private Integer poId;
    private Integer grnId;
    private Integer supplierId;
    private String supplierNameAr;
    private String currency;
    private BigDecimal exchangeRate;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private String status;
    private String approvalStatus;
    private String paymentTerms;
    private String notes;
    private List<SupplierInvoiceItemDto> items;
}
