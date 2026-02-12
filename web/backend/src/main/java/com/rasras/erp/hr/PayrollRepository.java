package com.rasras.erp.hr;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollRepository extends JpaRepository<Payroll, Integer> {

    List<Payroll> findByPayrollMonthAndPayrollYear(Integer payrollMonth, Integer payrollYear);
}

