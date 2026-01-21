package com.rasras.erp.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseLocationDto {
    private Integer id;
    private Integer warehouseId;
    private String locationCode;
    private String locationName;
    private String row;
    private String shelf;
    private String bin;
    private Boolean isActive;
}
