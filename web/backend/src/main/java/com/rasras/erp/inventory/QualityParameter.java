package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "qualityparameters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityParameter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ParameterID")
    private Integer id;

    @Column(name = "ParameterNameAr", nullable = false)
    private String parameterNameAr;

    @Column(name = "ParameterNameEn")
    private String parameterNameEn;

    @Column(name = "ParameterCode", length = 20, nullable = false)
    private String parameterCode;

    @Column(name = "UnitOfMeasure")
    private String unit;

    @Column(name = "DataType", nullable = false)
    private String dataType; // NUMERIC, TEXT, BOOLEAN

    @Column(name = "Description")
    private String description;

    @Column(name = "StandardValue")
    private BigDecimal standardValue;

    @Column(name = "`MinValue`")
    private BigDecimal minValue;

    @Column(name = "`MaxValue`")
    private BigDecimal maxValue;

    @Builder.Default
    @Column(name = "IsActive")
    private Boolean isActive = true;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
