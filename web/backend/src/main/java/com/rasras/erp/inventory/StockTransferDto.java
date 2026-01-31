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
public class StockTransferDto {

    private Integer id;
    private String transferNumber;
    private LocalDateTime transferDate;
    private Integer fromWarehouseId;
    private String fromWarehouseNameAr;
    private Integer toWarehouseId;
    private String toWarehouseNameAr;
    private Integer requestedByUserId;
    private Integer transferredByUserId;
    private Integer receivedByUserId;
    private String status;
    private LocalDateTime shippedDate;
    private LocalDateTime receivedDate;
    private String notes;
    private List<StockTransferItemDto> items;
}
