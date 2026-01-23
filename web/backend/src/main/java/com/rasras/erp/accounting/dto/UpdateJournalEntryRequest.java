package com.rasras.erp.accounting.dto;

import jakarta.validation.constraints.Positive;
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
public class UpdateJournalEntryRequest {
    
    private LocalDate entryDate;
    private Integer fiscalYearId;
    private Integer periodId;
    private String entryType;
    private String sourceType;
    private Integer sourceId;
    private String sourceNumber;
    private String description;
    
    @Positive(message = "Total debit must be positive")
    private BigDecimal totalDebit;
    
    @Positive(message = "Total credit must be positive")
    private BigDecimal totalCredit;
    
    private String currency;
    private BigDecimal exchangeRate;
    private String status;
    private String notes;
}
