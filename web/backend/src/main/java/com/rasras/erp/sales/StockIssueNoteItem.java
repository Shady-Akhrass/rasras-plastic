package com.rasras.erp.sales;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "stockissuenoteitems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockIssueNoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IssueItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IssueNoteID", nullable = false)
    private StockIssueNote stockIssueNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOItemID", nullable = false)
    private SalesOrderItem salesOrderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "RequestedQty", nullable = false, precision = 18, scale = 3)
    private BigDecimal requestedQty;

    @Column(name = "IssuedQty", nullable = false, precision = 18, scale = 3)
    private BigDecimal issuedQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "UnitCost", precision = 18, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "TotalCost", precision = 18, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "LotNumber", length = 50)
    private String lotNumber;

    @Column(name = "BatchID")
    private Integer batchId;

    @Column(name = "LocationID")
    private Integer locationId;

    @Column(name = "Notes", length = 500)
    private String notes;
}
