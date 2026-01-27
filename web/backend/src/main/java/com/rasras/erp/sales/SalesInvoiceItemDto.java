package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesInvoiceItemDto {
    private Integer id;
    private Integer salesInvoiceId;
    private Integer issueItemId;
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private String itemNameEn;
    private String description;
    private BigDecimal quantity;
    private Integer unitId;
    private String unitNameAr;
    private BigDecimal unitPrice;
    private BigDecimal unitCost;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
    private BigDecimal grossProfit;
}
