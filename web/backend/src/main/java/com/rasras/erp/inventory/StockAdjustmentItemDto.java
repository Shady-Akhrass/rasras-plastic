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
public class StockAdjustmentItemDto {
    private Integer id;
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private Integer unitId;
    private String unitNameAr;
    private BigDecimal systemQty;
    private BigDecimal actualQty;
    private BigDecimal adjustmentQty;
    private BigDecimal unitCost;
    private BigDecimal adjustmentValue;
    private String notes;
}
