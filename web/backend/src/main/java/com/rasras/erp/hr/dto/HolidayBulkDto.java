package com.rasras.erp.hr.dto;

import lombok.Data;
import java.util.List;

@Data
public class HolidayBulkDto {
    private String fromDate; // yyyy-MM-dd
    private String toDate; // yyyy-MM-dd
    private String holidayNameAr;
    private String holidayNameEn;
    private Boolean isActive;
}
