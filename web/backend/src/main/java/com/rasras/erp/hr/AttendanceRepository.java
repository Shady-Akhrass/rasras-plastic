package com.rasras.erp.hr;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    List<Attendance> findByEmployeeEmployeeIdAndAttendanceDateBetween(Integer employeeId, LocalDate from, LocalDate to);

    List<Attendance> findByAttendanceDateBetween(LocalDate from, LocalDate to);
}

