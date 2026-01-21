package com.rasras.erp.inventory;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityParameterDto {
    private Integer id;
    private String parameterCode;
    private String parameterNameAr;
    private String parameterNameEn;
    private String unit;
    private String dataType;
    private String description;
    private java.math.BigDecimal standardValue;
    private java.math.BigDecimal minValue;
    private java.math.BigDecimal maxValue;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
