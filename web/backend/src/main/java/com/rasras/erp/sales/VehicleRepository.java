package com.rasras.erp.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    List<Vehicle> findByIsActiveTrueOrderByVehicleCodeAsc();
    Optional<Vehicle> findByVehicleCode(String vehicleCode);
    Optional<Vehicle> findByPlateNumber(String plateNumber);
}
