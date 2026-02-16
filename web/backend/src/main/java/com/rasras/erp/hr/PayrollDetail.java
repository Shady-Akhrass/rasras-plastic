package com.rasras.erp.hr;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payrolldetails")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PayrollDetailID")
    private Integer payrollDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PayrollID", nullable = false)
    private Payroll payroll;

    @Column(name = "ComponentID", nullable = false)
    private Integer componentId;

    @Column(name = "Amount", nullable = false)
    private BigDecimal amount;
}

