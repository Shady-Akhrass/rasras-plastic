package com.rasras.erp.procurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseReturnItemRepository extends JpaRepository<PurchaseReturnItem, Integer> {

    List<PurchaseReturnItem> findByGrnItemIdIn(List<Integer> grnItemIds);
}
