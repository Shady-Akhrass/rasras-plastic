package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private Integer id;
    private String vehicleCode;
    private String plateNumber;
    private String vehicleType;
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal capacity;
    private String ownershipType;
    private Integer driverId;
    private String driverName;
    private String driverPhone;
    private LocalDate licenseExpiry;
    private LocalDate insuranceExpiry;
    private Boolean isActive;
    private String notes;
}
