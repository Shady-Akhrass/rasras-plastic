package com.rasras.erp.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignPermissionsRequest {

    @NotNull(message = "Permission IDs are required")
    private List<Integer> permissionIds;
}
