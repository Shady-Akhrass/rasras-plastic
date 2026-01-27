package com.rasras.erp.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalesQuotationRepository extends JpaRepository<SalesQuotation, Integer> {
    Optional<SalesQuotation> findByQuotationNumber(String quotationNumber);
}
