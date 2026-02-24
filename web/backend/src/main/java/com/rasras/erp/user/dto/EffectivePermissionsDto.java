package com.rasras.erp.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Effective permissions for a role (selected + dependency closure). For debugging and UI. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EffectivePermissionsDto {
    private Integer roleId;
    private String roleCode;
    private List<Integer> permissionIds;
    private List<String> permissionCodes;
}
