package com.rasras.erp.supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierBankRepository extends JpaRepository<SupplierBank, Integer> {
    List<SupplierBank> findBySupplierId(Integer supplierId);
}
