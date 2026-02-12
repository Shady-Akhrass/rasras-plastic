package com.rasras.erp.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeShiftDto {
    private Integer employeeShiftId;
    private Integer employeeId;
    private String employeeNameAr;
    private Integer shiftId;
    private String shiftCode;
    private String shiftNameAr;
    /** yyyy-MM-dd */
    private String effectiveFrom;
    /** yyyy-MM-dd */
    private String effectiveTo;
    private Boolean isActive;
}

