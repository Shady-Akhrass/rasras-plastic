package com.rasras.erp.supplier;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.inventory.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "supplierinvoiceitems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SIItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierInvoiceID", nullable = false)
    private SupplierInvoice invoice;

    @Column(name = "GRNItemID")
    private Integer grnItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "Quantity", precision = 18, scale = 3, nullable = false)
    private BigDecimal quantity;

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
}
