package com.rasras.erp.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceComparisonData {
    private Integer supplierInvoiceId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private BigDecimal invoiceTotal;
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
    private List<InvoiceItemComparison> items;
}
