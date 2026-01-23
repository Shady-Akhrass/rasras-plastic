package com.rasras.erp.supplier;

import com.rasras.erp.inventory.Item;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "supplieritems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SupplierItemID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "SupplierItemCode", length = 50)
    private String supplierItemCode;

    @Column(name = "LastPrice", precision = 18, scale = 4)
    private BigDecimal lastPrice;

    @Column(name = "LastPriceDate")
    private LocalDate lastPriceDate;

    @Column(name = "LeadTimeDays")
    private Integer leadTimeDays;

    @Column(name = "MinOrderQty", precision = 18, scale = 3)
    private BigDecimal minOrderQty;

    @Column(name = "IsPreferred")
    @Builder.Default
    private Boolean isPreferred = false;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;
}
