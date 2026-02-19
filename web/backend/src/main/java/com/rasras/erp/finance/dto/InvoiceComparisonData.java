package com.rasras.erp.finance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceComparisonData {

    private Integer supplierInvoiceId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private String currency;

    // Invoice breakdown
    private BigDecimal invoiceTotal;
    private BigDecimal invoiceSubTotal;
    private BigDecimal invoiceTaxAmount;
    private BigDecimal invoiceTaxPercentage;
    private BigDecimal invoiceDiscountAmount;
    private BigDecimal invoiceDiscountPercentage;
    private BigDecimal invoiceDeliveryCost;
    private BigDecimal invoiceOtherCosts;

    // PO breakdown
    private String poNumber;
    private BigDecimal poTotal;
    private BigDecimal poSubTotal;
    private BigDecimal poTaxAmount;
    private BigDecimal poTaxPercentage;
    private BigDecimal poDiscountAmount;
    private BigDecimal poDiscountPercentage;
    private BigDecimal poShippingCost;
    private BigDecimal poOtherCosts;

    // GRN breakdown
    private String grnNumber;
    private BigDecimal grnTotal;
    private BigDecimal grnSubTotal;
    private BigDecimal grnTaxAmount;
    private BigDecimal grnTaxPercentage;
    private BigDecimal grnDiscountAmount;
    private BigDecimal grnDiscountPercentage;
    private BigDecimal grnOtherCosts;
    private BigDecimal grnShippingCost;

    // Return breakdown
    private BigDecimal returnTotal;
    private BigDecimal returnSubTotal;

    // Variance & validation
    private BigDecimal variancePercentage;
    private Boolean isValid;

    // Payment tracking
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;

    // Item-level comparison
    private List<InvoiceItemComparison> items;
}