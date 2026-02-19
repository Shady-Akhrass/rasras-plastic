package com.rasras.erp.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemComparison {

    private String itemName;

    // PO
    private BigDecimal poQuantity;
    private BigDecimal poUnitPrice;
    private BigDecimal poDiscountPercentage;
    private BigDecimal poTaxPercentage;
    private BigDecimal poLineTotal;

    // GRN
    private BigDecimal grnQuantity;
    private BigDecimal grnUnitPrice;
    private BigDecimal grnLineTotal;

    // Invoice
    private BigDecimal invoiceQuantity;
    private BigDecimal invoiceUnitPrice;
    private BigDecimal invoiceLineTotal;

    // Purchase Returns — these three were missing
    private BigDecimal returnedQuantity;
    private BigDecimal returnUnitPrice;
    private BigDecimal returnLineTotal;

    // Match result
    private Boolean isMatch;
}