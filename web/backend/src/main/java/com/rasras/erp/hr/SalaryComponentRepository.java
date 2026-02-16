package com.rasras.erp.hr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, Integer> {
    Optional<SalaryComponent> findByComponentNameEn(String componentNameEn);
}
