package com.rasras.erp.employee;

import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DepartmentID")
    private Integer departmentId;

    @Column(name = "DepartmentCode", length = 10, nullable = false)
    private String departmentCode;

    @Column(name = "DepartmentNameAr", length = 100, nullable = false)
    private String departmentNameAr;

    @Column(name = "DepartmentNameEn", length = 100)
    private String departmentNameEn;

    @Column(name = "ParentDepartmentID")
    private Integer parentDepartmentId;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;
}
