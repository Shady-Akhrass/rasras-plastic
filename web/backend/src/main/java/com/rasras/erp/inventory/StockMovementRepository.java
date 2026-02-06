package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("SELECT m FROM StockMovement m WHERE m.item.id = :itemId")
    List<StockMovement> findByItemId(@Param("itemId") Integer itemId);

    @Query("SELECT m FROM StockMovement m WHERE m.warehouse.id = :warehouseId " +
            "AND m.movementDate >= :from AND m.movementDate < :to ORDER BY m.movementDate")
    List<StockMovement> findByWarehouseAndDateRange(
            @Param("warehouseId") Integer warehouseId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT m FROM StockMovement m WHERE m.movementDate >= :from AND m.movementDate < :to ORDER BY m.warehouse.id, m.item.id, m.movementDate")
    List<StockMovement> findByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
