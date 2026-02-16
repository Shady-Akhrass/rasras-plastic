package com.rasras.erp.hr.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayrollItemDto {

    private Integer componentId;
    private String componentNameAr;
    private String componentType; // EARNING / DEDUCTION
    private Double amount;
}

