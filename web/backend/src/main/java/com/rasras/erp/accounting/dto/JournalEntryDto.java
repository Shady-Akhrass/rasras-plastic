package com.rasras.erp.accounting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntryDto {
    private Integer journalEntryId;
    private String entryNumber;
    private LocalDate entryDate;
    private Integer fiscalYearId;
    private Integer periodId;
    private String entryType;
    private String sourceType;
    private Integer sourceId;
    private String sourceNumber;
    private String description;
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private String currency;
    private BigDecimal exchangeRate;
    private String status;
    private Integer postedByUserId;
    private LocalDateTime postedDate;
    private Integer reversedByEntryId;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
}
