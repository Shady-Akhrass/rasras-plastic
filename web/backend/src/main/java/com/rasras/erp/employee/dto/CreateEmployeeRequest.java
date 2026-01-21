package com.rasras.erp.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {
    @NotBlank(message = "Employee code is required")
    private String employeeCode;

    @NotBlank(message = "First name (Ar) is required")
    private String firstNameAr;

    @NotBlank(message = "Last name (Ar) is required")
    private String lastNameAr;

    private String firstNameEn;
    private String lastNameEn;
    private String nationalId;
    private String email;
    private String phone;
    private String mobile;
    private String address;

    @NotNull(message = "Department ID is required")
    private Integer departmentId;

    private String jobTitle;
    private Integer managerId;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    private BigDecimal basicSalary;
}
