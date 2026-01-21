package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "warehouses")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WarehouseID")
    private Integer id;

    @Column(name = "WarehouseCode", nullable = false, unique = true)
    private String warehouseCode;

    @Column(name = "WarehouseNameAr", nullable = false)
    private String warehouseNameAr;

    @Column(name = "WarehouseNameEn")
    private String warehouseNameEn;

    @Column(name = "WarehouseType", nullable = false)
    private String warehouseType;

    @Column(name = "Address")
    private String address;

    @Column(name = "ManagerID")
    private Integer managerId;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "IsActive")
    private Boolean isActive;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
}
