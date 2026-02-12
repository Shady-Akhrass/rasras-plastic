package com.rasras.erp.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeDto {
    private String leaveTypeCode;
    private String leaveTypeNameAr;
    private String leaveTypeNameEn;
    private Boolean isPaid;
    private Integer maxDaysPerYear;
    private Boolean isActive;
}

