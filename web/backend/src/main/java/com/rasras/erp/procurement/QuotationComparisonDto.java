package com.rasras.erp.procurement;

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
public class QuotationComparisonDto {
    private Integer id;
    private String comparisonNumber;
    private LocalDateTime comparisonDate;
    private Integer prId;
    private String prNumber; // UI helper
    private Integer itemId;
    private String itemNameAr; // UI helper
    private String itemNameEn; // Added based on snippet
    private Integer selectedQuotationId;
    private String selectedQuotationNumber; // UI helper
    private Integer selectedSupplierId;
    private String selectedSupplierNameAr; // UI helper
    private String selectionReason;
    private String status;
    private String approvalStatus;
    private Integer financeReviewedBy;
    private LocalDateTime financeReviewedDate;
    private Integer managementApprovedBy;
    private LocalDateTime managementApprovedDate;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private List<QuotationComparisonDetailDto> details;
}
