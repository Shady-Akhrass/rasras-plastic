package com.rasras.erp.hr;

import com.rasras.erp.employee.Employee;
import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payroll")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PayrollID")
    private Integer payrollId;

    @Column(name = "PayrollMonth", nullable = false)
    private Integer payrollMonth;

    @Column(name = "PayrollYear", nullable = false)
    private Integer payrollYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EmployeeID", nullable = false)
    private Employee employee;

    @Column(name = "BasicSalary")
    private BigDecimal basicSalary;

    @Column(name = "TotalEarnings")
    private BigDecimal totalEarnings;

    @Column(name = "TotalDeductions")
    private BigDecimal totalDeductions;

    @Column(name = "NetSalary")
    private BigDecimal netSalary;

    @Column(name = "Status", length = 20)
    private String status;

    @Column(name = "PaymentDate")
    private LocalDate paymentDate;

    @Column(name = "PaymentMethod", length = 20)
    private String paymentMethod;

    @Column(name = "BankAccountID")
    private Integer bankAccountId;

    @Column(name = "Notes", length = 500)
    private String notes;
}

