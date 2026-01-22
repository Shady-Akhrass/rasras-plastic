package com.rasras.erp.procurement;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "purchaserequisitionitems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequisitionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRID", nullable = false)
    private PurchaseRequisition purchaseRequisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "RequestedQty", nullable = false, precision = 18, scale = 3)
    private BigDecimal requestedQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "EstimatedUnitPrice", precision = 18, scale = 4)
    private BigDecimal estimatedUnitPrice;

    @Column(name = "EstimatedTotalPrice", precision = 18, scale = 2)
    private BigDecimal estimatedTotalPrice;

    @Column(name = "RequiredDate")
    private LocalDate requiredDate;

    @Column(name = "Specifications", length = 500)
    private String specifications;

    @Column(name = "Notes", length = 500)
    private String notes;
}
