package com.rasras.erp.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private Integer employeeId;
    private String employeeCode;
    private String firstNameAr;
    private String lastNameAr;
    private String firstNameEn;
    private String lastNameEn;
    private String fullNameAr;
    private String fullNameEn;
    private String email;
    private String phone;
    private String mobile;
    private String jobTitle;
    private Integer departmentId;
    private String departmentNameAr;
    private LocalDate hireDate;
    private Boolean isActive;
    private BigDecimal basicSalary;
}
