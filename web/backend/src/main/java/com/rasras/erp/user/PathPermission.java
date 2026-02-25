package com.rasras.erp.user;

import jakarta.persistence.*;
import lombok.*;

/**
 * ربط مسار الطلب (API أو واجهة) بصلاحية واحدة.
 * مصدر واحد للقواعد (Data-Driven Authorization).
 */
@Entity
@Table(name = "path_permission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PathPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PathPermissionID")
    private Integer id;

    @Column(name = "PathPattern", nullable = false, length = 255)
    private String pathPattern;

    @Column(name = "HttpMethod", nullable = false, length = 10)
    @Builder.Default
    private String httpMethod = "*";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PermissionID", nullable = false)
    private Permission permission;

    @Column(name = "Priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "PathType", nullable = false, length = 20)
    @Builder.Default
    private PathType pathType = PathType.API;
}
