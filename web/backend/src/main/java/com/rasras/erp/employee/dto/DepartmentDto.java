package com.rasras.erp.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDto {
    private Integer departmentId;
    private String departmentCode;
    private String departmentNameAr;
    private String departmentNameEn;
    private Integer parentDepartmentId;
    private Boolean isActive;
}
