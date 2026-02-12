package com.rasras.erp.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkShiftDto {
    private Integer shiftId;
    private String shiftCode;
    private String shiftNameAr;
    private String shiftNameEn;
    /** HH:mm */
    private String startTime;
    /** HH:mm */
    private String endTime;
    private Integer graceMinutes;
    private Boolean isNightShift;
    private Boolean isActive;
}

