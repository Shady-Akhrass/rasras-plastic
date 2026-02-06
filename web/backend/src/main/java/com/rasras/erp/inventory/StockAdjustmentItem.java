package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "stockadjustmentitems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustmentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AdjItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AdjustmentID", nullable = false)
    private StockAdjustment adjustment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "LocationID")
    private Integer locationId;

    @Column(name = "LotNumber", length = 50)
    private String lotNumber;

    @Column(name = "SystemQty", nullable = false, precision = 18, scale = 3)
    private BigDecimal systemQty;

    @Column(name = "ActualQty", nullable = false, precision = 18, scale = 3)
    private BigDecimal actualQty;

    @Column(name = "AdjustmentQty", precision = 18, scale = 3, insertable = false, updatable = false)
    private BigDecimal adjustmentQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "UnitCost", precision = 18, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "AdjustmentValue", precision = 18, scale = 2)
    private BigDecimal adjustmentValue;

    @Column(name = "Notes", length = 500)
    private String notes;
}
