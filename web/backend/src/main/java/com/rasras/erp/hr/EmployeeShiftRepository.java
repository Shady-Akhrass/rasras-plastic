package com.rasras.erp.hr;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeShiftRepository extends JpaRepository<EmployeeShift, Integer> {
    List<EmployeeShift> findByEmployeeEmployeeId(Integer employeeId);
    List<EmployeeShift> findByIsActiveTrue();
}

