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
public class SalesOrderItemDto {
    private Integer id;
    private Integer salesOrderId;
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private String itemNameEn;
    private String description;
    private BigDecimal orderedQty;
    private Integer unitId;
    private String unitNameAr;
    private BigDecimal unitPrice;
    private BigDecimal unitCost;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
    private BigDecimal deliveredQty;
    private String status;
    private Integer warehouseId;
    private String warehouseName;
    private String notes;
}
