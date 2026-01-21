package com.rasras.erp.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDto {

    private Integer permissionId;
    private String permissionCode;
    private String permissionNameAr;
    private String permissionNameEn;
    private String moduleName;
    private String actionType;
    private Boolean isActive;
}
