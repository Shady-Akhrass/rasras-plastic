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
    private BigDecimal poQuantity;
    private BigDecimal grnQuantity;
    private BigDecimal invoiceQuantity;
    private BigDecimal poUnitPrice;
    private BigDecimal grnUnitPrice;
    private BigDecimal invoiceUnitPrice;
    private BigDecimal poLineTotal;
    private BigDecimal grnLineTotal;
    private BigDecimal invoiceLineTotal;
    private Boolean isMatch;
}
