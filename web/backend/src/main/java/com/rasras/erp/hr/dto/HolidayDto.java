package com.rasras.erp.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDto {
    private Integer holidayId;
    /** yyyy-MM-dd */
    private String holidayDate;
    private String holidayNameAr;
    private String holidayNameEn;
    private Boolean isActive;
}

