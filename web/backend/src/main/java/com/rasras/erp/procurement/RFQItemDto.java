package com.rasras.erp.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RFQItemDto {
    private Integer id;
    private Integer rfqId;
    private Integer itemId;
    private String itemNameAr; // UI helper
    private String itemCode; // UI helper
    private BigDecimal requestedQty;
    private Integer unitId;
    private String unitName; // UI helper
    private String specifications;
    private BigDecimal estimatedPrice; // السعر التقريبي من طلب الشراء/طلب السعر
}
