package com.rasras.erp.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {

    private Integer roleId;
    private String roleCode;
    private String roleNameAr;
    private String roleNameEn;
    private String description;
    private Boolean isActive;
    private java.util.List<Integer> permissionIds;
}
