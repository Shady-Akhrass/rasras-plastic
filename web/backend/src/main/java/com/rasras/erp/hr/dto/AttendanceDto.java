package com.rasras.erp.hr.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttendanceDto {

    private Integer attendanceId;
    private Integer employeeId;
    private String employeeNameAr;
    /** yyyy-MM-dd */
    private String attendanceDate;
    /** HH:mm */
    private String checkInTime;
    /** HH:mm */
    private String checkOutTime;
    private String status;
    private String leaveType;
    private Double overtimeHours;
    private String notes;
}

