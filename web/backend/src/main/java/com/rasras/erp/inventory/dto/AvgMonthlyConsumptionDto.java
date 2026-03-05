package com.rasras.erp.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvgMonthlyConsumptionDto {
    private BigDecimal avgMonthlyConsumption;
    private int monthsUsed;
}
