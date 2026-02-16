package com.rasras.erp.supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Integer> {
    List<SupplierInvoice> findBySupplierId(Integer supplierId);

    List<SupplierInvoice> findByStatus(String status);

    List<SupplierInvoice> findByStatusIn(List<String> statuses);

    boolean existsByGrnId(Integer grnId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT i.poId FROM SupplierInvoice i WHERE i.poId IS NOT NULL")
    List<Integer> findAllInvoicedPoIds();
}
