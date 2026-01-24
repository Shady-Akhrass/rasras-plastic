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
public class PurchaseOrderItemDto {
    private Integer id;
    private Integer itemId;
    private String itemNameAr; // UI helper
    private String description;
    private BigDecimal orderedQty;
    private Integer unitId;
    private String unitNameAr; // UI helper
    private BigDecimal unitPrice;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
    private BigDecimal receivedQty;
    private BigDecimal remainingQty;
    private String status;
    private String notes;
}
