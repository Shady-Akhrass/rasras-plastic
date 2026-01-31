package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * إذن تحويل بين مخازن (Stock Transfer).
 * Maps to table: stocktransfers
 */
@Entity
@Table(name = "stocktransfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TransferID")
    private Integer id;

    @Column(name = "TransferNumber", nullable = false, length = 30, unique = true)
    private String transferNumber;

    @Column(name = "TransferDate", nullable = false)
    @Builder.Default
    private LocalDateTime transferDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FromWarehouseID", nullable = false)
    private Warehouse fromWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ToWarehouseID", nullable = false)
    private Warehouse toWarehouse;

    @Column(name = "RequestedByUserID", nullable = false)
    private Integer requestedByUserId;

    @Column(name = "TransferredByUserID")
    private Integer transferredByUserId;

    @Column(name = "ReceivedByUserID")
    private Integer receivedByUserId;

    @Column(name = "Status", length = 20, nullable = false)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "ShippedDate")
    private LocalDateTime shippedDate;

    @Column(name = "ReceivedDate")
    private LocalDateTime receivedDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "stockTransfer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockTransferItem> items;
}
