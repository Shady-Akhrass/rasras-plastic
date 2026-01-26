package com.rasras.erp.supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierItemRepository extends JpaRepository<SupplierItem, Integer> {
    List<SupplierItem> findBySupplierId(Integer supplierId);

    List<SupplierItem> findByItemId(Integer itemId);

    java.util.Optional<SupplierItem> findBySupplierIdAndItemId(Integer supplierId, Integer itemId);
}
