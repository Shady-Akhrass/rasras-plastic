package com.rasras.erp.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyInfoRepository extends JpaRepository<CompanyInfo, Integer> {
    // We assume there's only one company record, usually with ID 1
    Optional<CompanyInfo> findTopByOrderByIdAsc();
}
