package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<UnitOfMeasure, Integer> {
    List<UnitOfMeasure> findByIsActiveTrue();
}
