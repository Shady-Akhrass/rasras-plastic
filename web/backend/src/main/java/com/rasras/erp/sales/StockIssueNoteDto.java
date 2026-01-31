package com.rasras.erp.sales;

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
public class StockIssueNoteDto {
    private Integer id;
    private String issueNoteNumber;
    private LocalDateTime issueDate;
    private Integer salesOrderId;
    private String soNumber;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private Integer warehouseId;
    private String warehouseNameAr;
    private Integer issuedByUserId;
    private String receivedByName;
    private String receivedById;
    private String receivedBySignature;
    private String vehicleNo;
    private String driverName;
    private String status;
    private LocalDateTime deliveryDate;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
    private List<StockIssueNoteItemDto> items;
}
