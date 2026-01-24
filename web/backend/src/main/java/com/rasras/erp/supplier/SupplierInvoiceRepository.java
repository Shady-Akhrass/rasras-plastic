package com.rasras.erp.supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Integer> {
    List<SupplierInvoice> findBySupplierId(Integer supplierId);

    List<SupplierInvoice> findByStatus(String status);
}
