package com.rasras.erp.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rolepermissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RolePermissionID")
    private Integer rolePermissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleID", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PermissionID", nullable = false)
    private Permission permission;

    @Column(name = "IsAllowed")
    @Builder.Default
    private Boolean isAllowed = true;
}
