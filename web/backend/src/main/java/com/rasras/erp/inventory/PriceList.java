package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pricelists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PriceListID")
    private Integer id;

    @Column(name = "PriceListCode", nullable = false)
    private String priceListCode;

    @Column(name = "PriceListName", nullable = false)
    private String priceListName;

    // This field serves to satisfy the dirty DB schema which has `listNameAr`
    // column as NOT NULL
    // This column likely appeared due to ddl-auto=update in the past.
    // We map it here to ensure it gets populated, avoiding the "doesn't have a
    // default value" error.
    @Column(name = "listNameAr", insertable = true, updatable = true)
    private String legacyListNameAr;

    // Legacy column support: The DB has a listType column that is NOT NULL but
    // missing from the provided script.
    // We must map it to populate it and prevent the 1364 error.
    @Column(name = "listType", insertable = true, updatable = true)
    private String listType; // SELLING, BUYING

    @Column(length = 3)
    private String currency;

    @Column(name = "EffectiveFrom", nullable = false)
    private LocalDate validFrom;

    @Column(name = "EffectiveTo")
    private LocalDate validTo;

    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    protected void syncLegacyFields() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        // Ensure legacy fields are populated from new fields
        if (this.legacyListNameAr == null && this.priceListName != null) {
            this.legacyListNameAr = this.priceListName;
        }
    }
}
