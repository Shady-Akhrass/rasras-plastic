package com.rasras.erp.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequestDto {
    private Integer id;
    private String workflowName;
    private String documentType;
    private Integer documentId;
    private String documentNumber;
    private String requestedByName;
    private BigDecimal totalAmount;
    private String status;
    private String currentStepName;
    private LocalDateTime requestedDate;
    private LocalDateTime completedDate;
    private String priority; // Derived or default
}
