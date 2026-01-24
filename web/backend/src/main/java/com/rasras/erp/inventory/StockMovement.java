package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stockmovements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MovementID")
    private Long id;

    @Column(name = "MovementDate", nullable = false)
    @Builder.Default
    private LocalDateTime movementDate = LocalDateTime.now();

    @Column(name = "MovementType", nullable = false, length = 20)
    private String movementType; // GRN, RETURN, ADJUSTMENT, etc.

    @Column(name = "ReferenceType", length = 30)
    private String referenceType;

    @Column(name = "ReferenceID")
    private Integer referenceId;

    @Column(name = "ReferenceNumber", length = 30)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WarehouseID", nullable = false)
    private Warehouse warehouse;

    @Column(name = "Quantity", precision = 18, scale = 3, nullable = false)
    private BigDecimal quantity;

    @Column(name = "Direction", nullable = false, length = 3)
    private String direction; // IN, OUT

    @Column(name = "UnitCost", precision = 18, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "TotalCost", precision = 18, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "BalanceBefore", precision = 18, scale = 3)
    private BigDecimal balanceBefore;

    @Column(name = "BalanceAfter", precision = 18, scale = 3)
    private BigDecimal balanceAfter;

    @Column(name = "Notes", length = 500)
    private String notes;

    @Column(name = "CreatedAt", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;
}
