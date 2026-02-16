package com.rasras.erp.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequisitionDto {
    private Integer id;
    private String prNumber;
    private LocalDate prDate;

    private Integer requestedByDeptId;
    private String requestedByDeptName; // UI helper

    private Integer requestedByUserId;
    private String requestedByUserName; // UI helper

    private LocalDate requiredDate;
    private String priority;
    private String status;
    private BigDecimal totalEstimatedAmount;
    private String justification;

    private Integer approvedByUserId;
    private String approvedByUserName; // UI helper

    private LocalDateTime approvedDate;
    private String rejectionReason;
    private String notes;

    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;

    private List<PurchaseRequisitionItemDto> items;

    // Derived fields
    private Boolean hasActiveOrders;
    private Boolean hasComparison;
}
