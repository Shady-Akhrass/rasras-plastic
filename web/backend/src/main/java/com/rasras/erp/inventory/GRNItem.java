package com.rasras.erp.inventory;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "grnitems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GRNItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GRNItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GRNID", nullable = false)
    private GoodsReceiptNote grn;

    @Column(name = "POItemID", nullable = false)
    private Integer poItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "OrderedQty", precision = 18, scale = 3, nullable = false)
    private BigDecimal orderedQty;

    @Column(name = "ReceivedQty", precision = 18, scale = 3, nullable = false)
    private BigDecimal receivedQty;

    @Column(name = "AcceptedQty", precision = 18, scale = 3)
    private BigDecimal acceptedQty;

    @Column(name = "RejectedQty", precision = 18, scale = 3)
    @Builder.Default
    private BigDecimal rejectedQty = BigDecimal.ZERO;

    @Column(name = "DamagedQty", precision = 18, scale = 3)
    @Builder.Default
    private BigDecimal damagedQty = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "UnitCost", precision = 18, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "TotalCost", precision = 18, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "LotNumber", length = 50)
    private String lotNumber;

    @Column(name = "ManufactureDate")
    private LocalDate manufactureDate;

    @Column(name = "ExpiryDate")
    private LocalDate expiryDate;

    @Column(name = "LocationID")
    private Integer locationId;

    @Column(name = "QualityStatus", length = 20)
    private String qualityStatus;

    @Column(name = "QualityReportID")
    private Integer qualityReportId;

    @Column(name = "Notes", length = 500)
    private String notes;
}
