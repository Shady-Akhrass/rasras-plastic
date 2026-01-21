package com.rasras.erp.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PermissionID")
    private Integer permissionId;

    @Column(name = "PermissionCode", nullable = false, unique = true, length = 50)
    private String permissionCode;

    @Column(name = "PermissionNameAr", nullable = false, length = 100)
    private String permissionNameAr;

    @Column(name = "PermissionNameEn", length = 100)
    private String permissionNameEn;

    @Column(name = "ModuleName", length = 50)
    private String moduleName;

    @Column(name = "ActionType", length = 20)
    private String actionType;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;
}
