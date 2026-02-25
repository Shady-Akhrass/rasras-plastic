package com.rasras.erp.user;

import jakarta.persistence.*;
import lombok.*;

/**
 * When a permission (e.g. MENU_OPERATIONS_ITEMS) is granted to a role,
 * requiresPermission (e.g. SECTION_WAREHOUSE) must also be granted so API calls don't 403.
 * Resolved at assign-permissions time via transitive closure.
 */
@Entity
@Table(name = "permission_dependencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requires_permission_id", nullable = false)
    private Permission requiresPermission;
}
