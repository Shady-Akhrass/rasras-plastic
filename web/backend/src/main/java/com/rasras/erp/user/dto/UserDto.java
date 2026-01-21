package com.rasras.erp.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Integer userId;
    private String username;
    private Integer employeeId;
    private Integer roleId;
    private String roleName;
    private Boolean isActive;
    private Boolean isLocked;
    private LocalDateTime lastLoginAt;
}
