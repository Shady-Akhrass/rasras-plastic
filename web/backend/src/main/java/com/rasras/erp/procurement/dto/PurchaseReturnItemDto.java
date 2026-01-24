package com.rasras.erp.procurement.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseReturnItemDto {
    private Integer id;
    private Integer itemId;
    private String itemNameAr;
    private Integer grnItemId;
    private BigDecimal returnedQty;
    private Integer unitId;
    private String unitNameAr;
    private BigDecimal unitPrice;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
    private String returnReason;
    private String lotNumber;
}
