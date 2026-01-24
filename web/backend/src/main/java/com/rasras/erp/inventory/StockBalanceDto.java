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
public class StockBalanceDto {
    private Integer id;
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private Integer warehouseId;
    private String warehouseNameAr;
    private BigDecimal quantityOnHand;
    private BigDecimal quantityReserved;
    private BigDecimal availableQty;
    private BigDecimal averageCost;
    private LocalDateTime lastMovementDate;
}
