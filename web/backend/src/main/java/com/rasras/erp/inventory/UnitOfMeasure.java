package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unitsofmeasure")
@EntityListeners(AuditingEntityListener.class)
public class UnitOfMeasure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UnitID")
    private Integer id;

    @Column(name = "UnitCode", nullable = false)
    private String unitCode;

    @Column(name = "UnitNameAr", nullable = false)
    private String unitNameAr;

    @Column(name = "UnitNameEn")
    private String unitNameEn;

    @Column(name = "IsBaseUnit")
    private Boolean isBaseUnit;

    @Column(name = "BaseUnitID")
    private Integer baseUnitId;

    // Optional: Relationship to self if needed for JPA traversal, but ID is enough
    // for simple cases
    // @ManyToOne
    // @JoinColumn(name = "BaseUnitID", insertable = false, updatable = false)
    // private UnitOfMeasure baseUnit;

    @Column(name = "ConversionFactor")
    private BigDecimal conversionFactor;

    @Column(name = "IsActive")
    private Boolean isActive;
}
