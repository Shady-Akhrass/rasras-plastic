package com.rasras.erp.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** صف في تقرير سجل الاعتمادات — من اعتمد ومتى */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalAuditDto {
    private Integer actionId;
    private Integer requestId;
    private String documentType;
    private Integer documentId;
    private String documentNumber;
    private String workflowName;
    private String stepName;
    private String actionType;
    private String actionByUser;
    private LocalDateTime actionDate;
    private String comments;
    private BigDecimal totalAmount;
    private String requestStatus;
}
