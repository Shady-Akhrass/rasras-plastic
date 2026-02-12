package com.rasras.erp.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for item movement report (date, type, qty, balance, ref).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementItemDto {

    private LocalDateTime date;
    private String type;      // movementType (GRN, RETURN, ADJUSTMENT, etc.)
    private BigDecimal qty;   // quantity
    private BigDecimal balance; // balanceAfter
    private String ref;       // reference number or referenceType + referenceId
}
