package com.rasras.erp.accounting;

import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "journalentries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JournalEntryID")
    private Integer journalEntryId;

    @Column(name = "EntryNumber", length = 20, nullable = false, unique = true)
    private String entryNumber;

    @Column(name = "EntryDate", nullable = false)
    private LocalDate entryDate;

    @Column(name = "FiscalYearID", nullable = false)
    private Integer fiscalYearId;

    @Column(name = "PeriodID", nullable = false)
    private Integer periodId;

    @Column(name = "EntryType", length = 20, nullable = false)
    private String entryType;

    @Column(name = "SourceType", length = 30)
    private String sourceType;

    @Column(name = "SourceID")
    private Integer sourceId;

    @Column(name = "SourceNumber", length = 30)
    private String sourceNumber;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "TotalDebit", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalDebit;

    @Column(name = "TotalCredit", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalCredit;

    @Column(name = "Currency", length = 3)
    @Builder.Default
    private String currency = "EGP";

    @Column(name = "ExchangeRate", precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "PostedByUserID")
    private Integer postedByUserId;

    @Column(name = "PostedDate")
    private LocalDateTime postedDate;

    @Column(name = "ReversedByEntryID")
    private Integer reversedByEntryId;

    @Column(name = "Notes", length = 1000)
    private String notes;
}
