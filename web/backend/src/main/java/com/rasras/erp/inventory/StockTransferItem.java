package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * بند إذن تحويل (Stock Transfer Item).
 * Maps to table: stocktransferitems
 */
@Entity
@Table(name = "stocktransferitems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransferItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TransferItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TransferID", nullable = false)
    private StockTransfer stockTransfer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "RequestedQty", precision = 18, scale = 3, nullable = false)
    private BigDecimal requestedQty;

    @Column(name = "TransferredQty", precision = 18, scale = 3)
    private BigDecimal transferredQty;

    @Column(name = "ReceivedQty", precision = 18, scale = 3)
    private BigDecimal receivedQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "FromLocationID")
    private Integer fromLocationId;

    @Column(name = "ToLocationID")
    private Integer toLocationId;

    @Column(name = "LotNumber", length = 50)
    private String lotNumber;

    @Column(name = "Notes", length = 500)
    private String notes;
}
