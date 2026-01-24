package com.rasras.erp.procurement;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

import java.math.BigDecimal;

@Entity
@Table(name = "purchaseorderitems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POID", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "OrderedQty", precision = 18, scale = 3, nullable = false)
    private BigDecimal orderedQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "UnitPrice", precision = 18, scale = 4, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "DiscountPercentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "DiscountAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "TaxPercentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Column(name = "TaxAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "TotalPrice", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "ReceivedQty", precision = 18, scale = 3)
    @Builder.Default
    private BigDecimal receivedQty = BigDecimal.ZERO;

    // RemainingQty is a generated column in SQL: `OrderedQty` - `ReceivedQty`
    // We'll map it as read-only or calculate it in service
    @Column(name = "RemainingQty", insertable = false, updatable = false)
    private BigDecimal remainingQty;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Pending";

    @Column(name = "Notes", length = 500)
    private String notes;
}
