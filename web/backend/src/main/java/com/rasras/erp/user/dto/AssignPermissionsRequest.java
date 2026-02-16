package com.rasras.erp.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** طلب تعيين صلاحيات الدور — يُستخدم في POST /roles/{id}/permissions */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignPermissionsRequest {

    @NotNull(message = "قائمة الصلاحيات مطلوبة (يمكن أن تكون فارغة)")
    private List<Integer> permissionIds;
}
