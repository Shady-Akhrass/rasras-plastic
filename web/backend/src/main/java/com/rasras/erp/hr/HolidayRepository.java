package com.rasras.erp.hr;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayRepository extends JpaRepository<Holiday, Integer> {
    List<Holiday> findByIsActiveTrue();
    Optional<Holiday> findByHolidayDate(LocalDate holidayDate);
}

