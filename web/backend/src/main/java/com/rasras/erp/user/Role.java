package com.rasras.erp.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoleID")
    private Integer roleId;

    @Column(name = "RoleCode", nullable = false, unique = true, length = 20)
    private String roleCode;

    @Column(name = "RoleNameAr", nullable = false, length = 100)
    private String roleNameAr;

    @Column(name = "RoleNameEn", length = 100)
    private String roleNameEn;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private List<RolePermission> rolePermissions;
}
