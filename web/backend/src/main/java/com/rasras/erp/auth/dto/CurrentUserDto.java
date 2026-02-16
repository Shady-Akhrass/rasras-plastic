package com.rasras.erp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** بيانات المستخدم الحالي + الصلاحيات — لاستدعاء تحديث الصلاحيات دون إعادة تسجيل الدخول */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserDto {
    private Integer userId;
    private Integer employeeId;
    private String username;
    private String roleCode;
    private String roleName;
    private String fullNameAr;
    private List<String> permissions;
}
