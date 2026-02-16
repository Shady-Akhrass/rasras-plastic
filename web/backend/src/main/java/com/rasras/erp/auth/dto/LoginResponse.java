package com.rasras.erp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Integer userId;
    private Integer employeeId;
    private String username;
    private String roleName;
    private String roleCode;
    private String fullNameAr;
    /** صلاحيات المستخدم (أكواد الصلاحيات من دور المستخدم) لاستخدامها ديناميكياً في القائمة والمسارات */
    private List<String> permissions;
}
