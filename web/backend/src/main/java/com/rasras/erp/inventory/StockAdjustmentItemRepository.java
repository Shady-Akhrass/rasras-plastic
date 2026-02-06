package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentItemRepository extends JpaRepository<StockAdjustmentItem, Integer> {

    List<StockAdjustmentItem> findByAdjustment_IdOrderByIdAsc(Integer adjustmentId);
}
