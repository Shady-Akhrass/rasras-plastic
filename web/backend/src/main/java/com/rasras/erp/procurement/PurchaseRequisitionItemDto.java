package com.rasras.erp.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequisitionItemDto {
    private Integer id;
    private Integer prId;

    private Integer itemId;
    private String itemNameAr; // UI helper
    private String itemNameEn; // UI helper
    private String itemCode; // UI helper

    private BigDecimal requestedQty;

    private Integer unitId;
    private String unitName; // UI helper

    private BigDecimal estimatedUnitPrice;
    private BigDecimal estimatedTotalPrice;
    private LocalDate requiredDate;
    private String specifications;
    private String notes;
}
