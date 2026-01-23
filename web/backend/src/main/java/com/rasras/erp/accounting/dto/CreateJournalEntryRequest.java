package com.rasras.erp.accounting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateJournalEntryRequest {
    
    @NotBlank(message = "Entry number is required")
    private String entryNumber;

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    @NotNull(message = "Fiscal year ID is required")
    @Positive(message = "Fiscal year ID must be positive")
    private Integer fiscalYearId;

    @NotNull(message = "Period ID is required")
    @Positive(message = "Period ID must be positive")
    private Integer periodId;

    @NotBlank(message = "Entry type is required")
    private String entryType;

    private String sourceType;
    private Integer sourceId;
    private String sourceNumber;
    private String description;

    @NotNull(message = "Total debit is required")
    @Positive(message = "Total debit must be positive")
    private BigDecimal totalDebit;

    @NotNull(message = "Total credit is required")
    @Positive(message = "Total credit must be positive")
    private BigDecimal totalCredit;

    private String currency;
    private BigDecimal exchangeRate;
    private String status;
    private String notes;
}
