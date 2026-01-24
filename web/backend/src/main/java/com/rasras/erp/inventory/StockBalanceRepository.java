package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StockBalanceRepository extends JpaRepository<StockBalance, Integer> {
    Optional<StockBalance> findByItemIdAndWarehouseId(Integer itemId, Integer warehouseId);
}
