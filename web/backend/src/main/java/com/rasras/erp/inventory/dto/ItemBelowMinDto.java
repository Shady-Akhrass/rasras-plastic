package com.rasras.erp.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * سطر في تقرير الأصناف تحت الحد الأدنى
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemBelowMinDto {
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private String grade;
    private Integer unitId;
    private String unitName;
    /** الرصيد المجمع (من كل المخازن أو المخزن المحدد) */
    private BigDecimal totalQuantityOnHand;
    private BigDecimal minStockLevel;
    private BigDecimal reorderLevel;
    private BigDecimal maxStockLevel;
    /** الفرق: الحد الأدنى - الرصيد الحالي */
    private BigDecimal diff;
}
