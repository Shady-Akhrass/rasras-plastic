package com.rasras.erp.employee;

import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EmployeeID")
    private Integer employeeId;

    @Column(name = "EmployeeCode", length = 20, nullable = false)
    private String employeeCode;

    @Column(name = "FirstNameAr", length = 50, nullable = false)
    private String firstNameAr;

    @Column(name = "LastNameAr", length = 50, nullable = false)
    private String lastNameAr;

    @Column(name = "FirstNameEn", length = 50)
    private String firstNameEn;

    @Column(name = "LastNameEn", length = 50)
    private String lastNameEn;

    @Column(name = "NationalID", length = 20)
    private String nationalId;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "Mobile", length = 20)
    private String mobile;

    @Column(name = "Address", length = 500)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DepartmentID", nullable = false)
    private Department department;

    @Column(name = "JobTitle", length = 100)
    private String jobTitle;

    @Column(name = "ManagerID")
    private Integer managerId;

    @Column(name = "HireDate", nullable = false)
    private LocalDate hireDate;

    @Column(name = "TerminationDate")
    private LocalDate terminationDate;

    @Column(name = "BasicSalary")
    private BigDecimal basicSalary;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;
}
