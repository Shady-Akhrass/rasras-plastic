package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ItemID")
    private Integer id;

    @Column(name = "ItemCode", nullable = false, unique = true)
    private String itemCode;

    @Column(name = "ItemNameAr", nullable = false)
    private String itemNameAr;

    @Column(name = "ItemNameEn")
    private String itemNameEn;

    @Column(name = "Grade")
    private String grade;

    @Column(name = "GradeName")
    private String gradeName;

    @Column(name = "MI2")
    private BigDecimal mi2;

    @Column(name = "MI21")
    private BigDecimal mi21;

    @Column(name = "Density")
    private BigDecimal density;

    @Column(name = "CategoryID", nullable = false)
    private Integer categoryId;

    @Column(name = "UnitID", nullable = false)
    private Integer unitId;

    @Column(name = "Barcode")
    private String barcode;

    @Column(name = "Description")
    private String description;

    @Column(name = "TechnicalSpecs")
    private String technicalSpecs;

    @Column(name = "MinStockLevel")
    private BigDecimal minStockLevel;

    @Column(name = "MaxStockLevel")
    private BigDecimal maxStockLevel;

    @Column(name = "ReorderLevel")
    private BigDecimal reorderLevel;

    @Column(name = "AvgMonthlyConsumption")
    private BigDecimal avgMonthlyConsumption;

    @Column(name = "StandardCost")
    private BigDecimal standardCost;

    @Column(name = "LastPurchasePrice")
    private BigDecimal lastPurchasePrice;

    @Column(name = "ReplacementPrice")
    private BigDecimal replacementPrice;

    @Column(name = "LastSalePrice")
    private BigDecimal lastSalePrice;

    @Column(name = "DefaultVATRate")
    private BigDecimal defaultVatRate;

    @Column(name = "ImagePath")
    private String imagePath;

    @Column(name = "IsActive")
    private Boolean isActive;

    @Column(name = "IsSellable")
    private Boolean isSellable;

    @Column(name = "IsPurchasable")
    private Boolean isPurchasable;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy")
    private Integer createdBy;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @Column(name = "UpdatedBy")
    private Integer updatedBy;
}