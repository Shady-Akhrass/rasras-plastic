package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseReturnRepository extends JpaRepository<PurchaseReturn, Integer> {
    List<PurchaseReturn> findByGrnId(Integer grnId);
}
