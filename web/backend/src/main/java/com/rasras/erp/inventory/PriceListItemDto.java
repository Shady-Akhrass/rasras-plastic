package com.rasras.erp.inventory;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceListItemDto {
    private Integer id;
    private Integer priceListId;
    private Integer itemId;
    private String itemNameAr;
    private String itemCode;
    private String grade;
    private Integer unitId;
    private String unitName;
    private BigDecimal unitPrice;
    private BigDecimal minQty;
    private BigDecimal maxQty;
    private BigDecimal discountPercentage;
}
