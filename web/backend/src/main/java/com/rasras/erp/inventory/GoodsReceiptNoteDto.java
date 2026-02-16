package com.rasras.erp.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptNoteDto {
    private Integer id;
    private String grnNumber;
    private LocalDateTime grnDate;
    private Integer poId;
    private String poNumber; // UI helper
    private Integer supplierId;
    private String supplierNameAr; // UI helper
    private Integer warehouseId;
    private String deliveryNoteNo;
    private String supplierInvoiceNo;
    private Integer receivedByUserId;
    private Integer inspectedByUserId;
    private String status;
    private String approvalStatus;
    private String qualityStatus;
    private BigDecimal totalReceivedQty;
    private BigDecimal totalAcceptedQty;
    private BigDecimal totalRejectedQty;
    private BigDecimal shippingCost;
    private BigDecimal otherCosts;
    private BigDecimal totalAmount;
    private String notes;
    private List<GRNItemDto> items;
}
