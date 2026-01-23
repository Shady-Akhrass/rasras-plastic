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
public class SupplierQuotationItemDto {
    private Integer id;
    private Integer quotationId;
    private Integer itemId;
    private String itemNameAr; // UI helper
    private String itemCode; // UI helper
    private BigDecimal offeredQty;
    private Integer unitId;
    private String unitName; // UI helper
    private BigDecimal unitPrice;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
    private Integer deliveryDays;
    private String notes;
}
