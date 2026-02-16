package com.rasras.erp.procurement;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "rfqitems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RFQItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RFQItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RFQID", nullable = false)
    private RequestForQuotation rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "RequestedQty", nullable = false, precision = 18, scale = 3)
    private BigDecimal requestedQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "Specifications", length = 500)
    private String specifications;

    @Column(name = "EstimatedUnitPrice", precision = 18, scale = 4)
    private BigDecimal estimatedUnitPrice;
}
