package com.rasras.erp.hr.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PayrollDto {

    private Integer payrollId;
    private Integer employeeId;
    private String employeeNameAr;
    private Integer payrollMonth;
    private Integer payrollYear;
    private Double basicSalary;
    private Double totalEarnings;
    private Double totalDeductions;
    private Double netSalary;
    private String status;
    private String paymentDate;
    private List<PayrollItemDto> items;
}

