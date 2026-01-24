package com.rasras.erp.supplier;

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
public class SupplierItemDto {
    private Integer id;
    private Integer supplierId;
    private String supplierNameAr;
    private Integer itemId;
    private String itemNameAr;
    private String itemCode;
    private String supplierItemCode;
    private BigDecimal lastPrice;
    private LocalDate lastPriceDate;
    private Integer leadTimeDays;
    private BigDecimal minOrderQty;
    private Boolean isPreferred;
    private Boolean isActive;
}
