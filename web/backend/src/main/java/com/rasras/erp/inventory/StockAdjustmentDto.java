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
public class StockAdjustmentDto {
    private Integer id;
    private String adjustmentNumber;
    private LocalDateTime adjustmentDate;
    private Integer warehouseId;
    private String warehouseNameAr;
    private String adjustmentType; // PERIODIC, SURPRISE, ADJUSTMENT
    private String reason;
    private String status;
    private Integer approvedByUserId;
    private LocalDateTime approvedDate;
    private LocalDateTime postedDate;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private List<StockAdjustmentItemDto> items;
}
