package com.rasras.erp.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodicInventoryReportDto {
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private String grade;
    private Integer warehouseId;
    private String warehouseNameAr;
    private BigDecimal openingQty;
    private BigDecimal additionsQty;
    private BigDecimal issuesQty;
    private BigDecimal closingQty;
    private BigDecimal averageCost;
    private BigDecimal openingValue;
    private BigDecimal additionsValue;
    private BigDecimal issuesValue;
    private BigDecimal closingValue;
    private BigDecimal minStockLevel;
}
