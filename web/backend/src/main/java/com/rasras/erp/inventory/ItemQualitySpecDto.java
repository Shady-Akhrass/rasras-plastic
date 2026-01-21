package com.rasras.erp.inventory;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemQualitySpecDto {
    private Integer id;
    private Integer itemId;
    private Integer parameterId;
    private String parameterNameAr;
    private String parameterNameEn;
    private String unit;
    private String dataType;
    private BigDecimal targetValue;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private Boolean isRequired;
}
