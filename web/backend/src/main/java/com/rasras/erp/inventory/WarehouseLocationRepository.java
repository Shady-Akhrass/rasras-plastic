package com.rasras.erp.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocation, Integer> {
    List<WarehouseLocation> findByWarehouseId(Integer warehouseId);

    List<WarehouseLocation> findByWarehouseIdAndIsActiveTrue(Integer warehouseId);
}
