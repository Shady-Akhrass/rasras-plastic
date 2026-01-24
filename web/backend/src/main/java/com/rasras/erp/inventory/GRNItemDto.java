package com.rasras.erp.inventory;

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
public class GRNItemDto {
    private Integer id;
    private Integer poItemId;
    private Integer itemId;
    private String itemNameAr; // UI helper
    private BigDecimal orderedQty;
    private BigDecimal receivedQty;
    private BigDecimal acceptedQty;
    private BigDecimal rejectedQty;
    private BigDecimal damagedQty;
    private Integer unitId;
    private String unitNameAr; // UI helper
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String lotNumber;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private Integer locationId;
    private String qualityStatus;
    private Integer qualityReportId;
    private String notes;
}
