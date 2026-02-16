package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesInvoiceDto {
    private Integer id;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private Integer salesOrderId;
    private String soNumber;
    private Integer issueNoteId;
    private String issueNoteNumber;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private Integer salesRepId;
    private String currency;
    private BigDecimal exchangeRate;
    private BigDecimal subTotal;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private String status;
    private String approvalStatus;
    private String eInvoiceStatus;
    private String eInvoiceUUID;
    private String paymentTerms;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
    private List<SalesInvoiceItemDto> items;
}
