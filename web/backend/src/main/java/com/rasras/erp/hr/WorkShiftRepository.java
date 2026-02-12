package com.rasras.erp.hr;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Integer> {
    List<WorkShift> findByIsActiveTrue();
    Optional<WorkShift> findByShiftCode(String shiftCode);
}

