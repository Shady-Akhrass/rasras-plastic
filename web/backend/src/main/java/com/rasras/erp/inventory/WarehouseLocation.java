package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "warehouselocations")
public class WarehouseLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LocationID")
    private Integer id;

    @Column(name = "WarehouseID", nullable = false)
    private Integer warehouseId;

    @Column(name = "LocationCode", nullable = false)
    private String locationCode;

    @Column(name = "LocationName")
    private String locationName;

    @Column(name = "`Row`")
    private String row;

    @Column(name = "Shelf")
    private String shelf;

    @Column(name = "`Bin`")
    private String bin;

    @Column(name = "IsActive")
    private Boolean isActive;
}
