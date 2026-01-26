package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityInspectionRepository extends JpaRepository<QualityInspection, Integer> {
    List<QualityInspection> findByReferenceIdAndReferenceType(Integer referenceId, String referenceType);
}
