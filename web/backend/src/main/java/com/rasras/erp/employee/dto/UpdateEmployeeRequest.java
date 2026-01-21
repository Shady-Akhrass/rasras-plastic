package com.rasras.erp.employee.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateEmployeeRequest {
    private String firstNameAr;
    private String lastNameAr;
    private String firstNameEn;
    private String lastNameEn;
    private String email;
    private String phone;
    private String mobile;
    private String address;
    private Integer departmentId;
    private String jobTitle;
    private Integer managerId;
    private LocalDate terminationDate;
    private BigDecimal basicSalary;
    private Boolean isActive;
}
