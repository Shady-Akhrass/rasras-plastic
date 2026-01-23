package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierQuotationRepository extends JpaRepository<SupplierQuotation, Integer> {
    List<SupplierQuotation> findByRfqId(Integer rfqId);

    List<SupplierQuotation> findBySupplierId(Integer supplierId);
}
