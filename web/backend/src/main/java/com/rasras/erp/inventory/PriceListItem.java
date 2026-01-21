package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pricelistitems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceListItem {
    @Id
    @Column(name = "PriceListItemID")
    private Integer id;

    @Column(name = "PriceListID", nullable = false)
    private Integer priceListId;

    @Column(name = "ItemID", nullable = false)
    private Integer itemId;

    @Column(name = "UnitPrice", nullable = false)
    private BigDecimal unitPrice;

    // Legacy column support: The DB has a `price` column in addition to UnitPrice.
    // Both seem to be NOT NULL in the running DB.
    @Column(name = "price", insertable = true, updatable = true)
    private BigDecimal legacyPrice;

    @Column(name = "MinQty")
    private BigDecimal minQty;

    @Column(name = "MaxQty")
    private BigDecimal maxQty;

    @Column(name = "DiscountPercentage")
    private BigDecimal discountPercentage;

    @PrePersist
    @PreUpdate
    protected void syncLegacyFields() {
        // Ensure legacy fields are populated from new fields
        if (this.legacyPrice == null && this.unitPrice != null) {
            this.legacyPrice = this.unitPrice;
        }
    }
}
