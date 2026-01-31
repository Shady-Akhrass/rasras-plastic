package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StockBalanceRepository extends JpaRepository<StockBalance, Integer> {

    @Query("SELECT b FROM StockBalance b WHERE b.item.id = :itemId AND b.warehouse.id = :warehouseId")
    Optional<StockBalance> findByItemIdAndWarehouseId(@Param("itemId") Integer itemId, @Param("warehouseId") Integer warehouseId);
}
