package com.rasras.erp.sales;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * مركبات التوصيل (Delivery Vehicles)
 */
@Entity
@Table(name = "vehicles")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VehicleID")
    private Integer id;

    @Column(name = "VehicleCode", nullable = false, length = 20, unique = true)
    private String vehicleCode;

    @Column(name = "PlateNumber", nullable = false, length = 20)
    private String plateNumber;

    @Column(name = "VehicleType", length = 30)
    private String vehicleType;

    @Column(name = "Brand", length = 50)
    private String brand;

    @Column(name = "Model", length = 50)
    private String model;

    @Column(name = "Year")
    private Integer year;

    @Column(name = "Capacity", precision = 10, scale = 2)
    private BigDecimal capacity;

    @Column(name = "OwnershipType", length = 20)
    private String ownershipType;

    @Column(name = "DriverID")
    private Integer driverId;

    @Column(name = "DriverName", length = 100)
    private String driverName;

    @Column(name = "DriverPhone", length = 20)
    private String driverPhone;

    @Column(name = "LicenseExpiry")
    private LocalDate licenseExpiry;

    @Column(name = "InsuranceExpiry")
    private LocalDate insuranceExpiry;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "Notes", length = 500)
    private String notes;
}
