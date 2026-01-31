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
@Table(name = "salesinvoiceitems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InvoiceItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SalesInvoiceID", nullable = false)
    private SalesInvoice salesInvoice;

    @Column(name = "IssueItemID")
    private Integer issueItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "Quantity", nullable = false, precision = 18, scale = 3)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UnitID", nullable = false)
    private UnitOfMeasure unit;

    @Column(name = "UnitPrice", nullable = false, precision = 18, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "UnitCost", precision = 18, scale = 4)
    private BigDecimal unitCost;

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

    @Column(name = "TotalPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalPrice;
}
