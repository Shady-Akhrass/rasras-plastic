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
public class StockTransferItemDto {

    private Integer id;
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private BigDecimal requestedQty;
    private BigDecimal transferredQty;
    private BigDecimal receivedQty;
    private Integer unitId;
    private String unitNameAr;
    private Integer fromLocationId;
    private Integer toLocationId;
    private String lotNumber;
    private String notes;
}
