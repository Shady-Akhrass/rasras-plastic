package com.rasras.erp.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDto {
    private Integer id;
    private String warehouseCode;
    private String warehouseNameAr;
    private String warehouseNameEn;
    private String warehouseType;
    private String address;
    private Integer managerId;
    private String managerName;
    private String managerDepartmentName;
    private String phone;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<WarehouseLocationDto> locations;
}
