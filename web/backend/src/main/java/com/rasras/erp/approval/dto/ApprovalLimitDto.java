package com.rasras.erp.approval.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApprovalLimitDto {

    private Integer id;
    private String activityType;
    private Integer roleId;
    private String roleCode;
    private String roleNameAr;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private BigDecimal minPercentage;
    private BigDecimal maxPercentage;
    private Boolean isActive;
}
