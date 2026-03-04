package com.rasras.erp.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignLeaveDto {
    private Integer employeeId;
    private String leaveTypeCode;
    private String fromDate; // yyyy-MM-dd
    private String toDate; // yyyy-MM-dd
    private String notes;
}
