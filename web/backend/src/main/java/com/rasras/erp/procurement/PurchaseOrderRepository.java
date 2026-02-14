package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    List<PurchaseOrder> findByPrId(Integer prId);

    // ✅ للحماية من إنشاء PO مزدوج من نفس العرض
    Optional<PurchaseOrder> findByQuotationId(Integer quotationId);
}
