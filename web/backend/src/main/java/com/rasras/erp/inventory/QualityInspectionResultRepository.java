package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityInspectionResultRepository extends JpaRepository<QualityInspectionResult, Integer> {
    List<QualityInspectionResult> findByInspectionId(Integer inspectionId);
}
