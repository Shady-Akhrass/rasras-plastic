package com.rasras.erp.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Integer id;
    private String itemCode;
    private String itemNameAr;
    private String itemNameEn;
    private String gradeName;
    private Integer categoryId;
    private String categoryName; // Useful for UI
    private Integer unitId;
    private String unitName; // Useful for UI
    private String barcode;
    private String description;
    private String technicalSpecs;
    private BigDecimal minStockLevel;
    private BigDecimal maxStockLevel;
    private BigDecimal reorderLevel;
    private BigDecimal avgMonthlyConsumption;
    private BigDecimal standardCost;
    private BigDecimal lastPurchasePrice;
    private BigDecimal replacementPrice;
    private BigDecimal lastSalePrice;
    private BigDecimal defaultVatRate;
    private String imagePath;
    private Boolean isActive;
    private Boolean isSellable;
    private Boolean isPurchasable;
    private LocalDateTime createdAt;
}
