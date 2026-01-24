package com.rasras.erp.procurement;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "purchasereturnitems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReturnItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PurchaseReturnID", nullable = false)
    private PurchaseReturn purchaseReturn;

    @Column(name = "GRNItemID")
    private Integer grnItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "ReturnedQty", precision = 18, scale = 3, nullable = false)
    private BigDecimal returnedQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "UnitPrice", precision = 18, scale = 4, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "TaxPercentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Column(name = "TaxAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "TotalPrice", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "ReturnReason", length = 100)
    private String returnReason;

    @Column(name = "LotNumber", length = 50)
    private String lotNumber;

    @Column(name = "Notes", length = 500)
    private String notes;
}
