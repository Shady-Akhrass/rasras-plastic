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
public class DeliveryOrderItemDto {
    private Integer itemId;
    private String itemNameAr;
    private String itemCode;
    private BigDecimal qty;
    private Integer unitId;
    private String unitNameAr;
    private BigDecimal unitPrice;
    private BigDecimal discountPercentage;
    private BigDecimal totalPrice;
    private String notes;
}
