package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "itemqualityspecs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemQualitySpec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SpecID")
    private Integer id;

    @Column(name = "ItemID", nullable = false)
    private Integer itemId;

    @Column(name = "ParameterID", nullable = false)
    private Integer parameterId;

    @Column(name = "TargetValue")
    private BigDecimal targetValue;

    @Column(name = "`MinValue`")
    private BigDecimal minValue;

    @Column(name = "`MaxValue`")
    private BigDecimal maxValue;

    @Builder.Default
    @Column(name = "IsCritical")
    private Boolean isRequired = false;

    @Builder.Default
    @Column(name = "IsActive")
    private Boolean isActive = true;
}
