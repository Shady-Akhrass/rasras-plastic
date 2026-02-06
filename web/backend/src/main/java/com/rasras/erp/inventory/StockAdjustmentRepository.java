package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Integer> {

    List<StockAdjustment> findByWarehouse_IdOrderByAdjustmentDateDesc(Integer warehouseId);

    @Query("SELECT a FROM StockAdjustment a WHERE a.status IN ('Approved','Posted') ORDER BY a.adjustmentDate DESC")
    List<StockAdjustment> findApprovedAdjustments();
}
