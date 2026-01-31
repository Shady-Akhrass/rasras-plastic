package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * تحذير نقص كمية صنف عند التحقق من توفر المخزون قبل إنشاء إذن الصرف
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAvailabilityWarningDto {
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private String unitNameAr;
    /** الكمية المطلوبة (المتبقية من أمر البيع) */
    private BigDecimal requestedQty;
    /** الكمية المتوفرة في المخزن */
    private BigDecimal availableQty;
    /** النقص (requestedQty - availableQty عندما المتوفرة أقل) */
    private BigDecimal shortfall;
}
