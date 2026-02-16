package com.rasras.erp.finance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVoucherAllocationDto {
    private Long id;
    private Integer allocationId;
    private Integer paymentVoucherId;
    private Integer supplierInvoiceId;
    private BigDecimal allocatedAmount;
    private LocalDate allocationDate; // ← ADD THIS LINE
    private String notes;

    // Matching Data for Detailed View
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private BigDecimal invoiceTotal;
    private BigDecimal invoicePreviouslyPaid;
    private BigDecimal invoiceSubTotal;
    private BigDecimal invoiceTaxAmount;
    private BigDecimal invoiceDiscountAmount;
    private BigDecimal invoiceDeliveryCost;
    private BigDecimal invoiceOtherCosts;

    private String poNumber;
    private BigDecimal poTotal;
    private BigDecimal poSubTotal;
    private BigDecimal poTaxAmount;
    private BigDecimal poDiscountAmount;
    private BigDecimal poShippingCost;
    private BigDecimal poOtherCosts;

    private String grnNumber;
    private BigDecimal grnTotal;
    private BigDecimal grnSubTotal;
    private BigDecimal grnTaxAmount;
    private BigDecimal grnDiscountAmount;
    private BigDecimal grnShippingCost;
    private BigDecimal grnOtherCosts;

    private BigDecimal variancePercentage;
    private Boolean isValid;
}