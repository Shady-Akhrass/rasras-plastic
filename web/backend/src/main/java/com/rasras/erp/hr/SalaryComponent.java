package com.rasras.erp.hr;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salarycomponents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ComponentID")
    private Integer componentId;

    @Column(name = "ComponentCode", length = 50, nullable = false)
    private String componentCode;

    @Column(name = "ComponentName", length = 100, nullable = false)
    private String componentName;

    @Column(name = "ComponentNameAr", length = 100, nullable = false)
    private String componentNameAr;

    @Column(name = "ComponentNameEn", length = 100)
    private String componentNameEn;

    @Column(name = "ComponentType", length = 20, nullable = false) // EARNING, DEDUCTION
    private String componentType;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;
}
