package com.rasras.erp.hr;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollDetailRepository extends JpaRepository<PayrollDetail, Integer> {

    List<PayrollDetail> findByPayrollPayrollId(Integer payrollId);
}

