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
public class UnitDto {
    private Integer id;
    private String unitCode;
    private String unitNameAr;
    private String unitNameEn;
    private Boolean isBaseUnit;
    private Integer baseUnitId;
    private String baseUnitName; // Useful for UI
    private BigDecimal conversionFactor;
    private Boolean isActive;
}
