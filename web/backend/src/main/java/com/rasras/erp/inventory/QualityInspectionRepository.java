package com.rasras.erp.inventory;

import java.util.List; // <--- This import was missing

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QualityInspectionRepository extends JpaRepository<QualityInspection, Integer> {
    List<QualityInspection> findByReferenceIdAndReferenceType(Integer referenceId, String referenceType);

    List<QualityInspection> findByReferenceTypeAndReferenceId(String referenceType, Integer referenceId);
}