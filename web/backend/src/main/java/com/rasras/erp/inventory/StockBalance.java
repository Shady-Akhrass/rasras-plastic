package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stockbalances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "StockBalanceID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WarehouseID", nullable = false)
    private Warehouse warehouse;

    @Column(name = "QuantityOnHand", precision = 18, scale = 3, nullable = false)
    @Builder.Default
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(name = "QuantityReserved", precision = 18, scale = 3, nullable = false)
    @Builder.Default
    private BigDecimal quantityReserved = BigDecimal.ZERO;

    @Column(name = "AvailableQty", precision = 18, scale = 3, insertable = false, updatable = false)
    private BigDecimal availableQty;

    @Column(name = "AverageCost", precision = 18, scale = 4)
    private BigDecimal averageCost;

    @Column(name = "LastMovementDate")
    private LocalDateTime lastMovementDate;

    @Column(name = "UpdatedAt")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
