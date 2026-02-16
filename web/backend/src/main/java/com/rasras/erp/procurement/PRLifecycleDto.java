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
public class PRLifecycleDto {
    private RequisitionStage requisition;
    private ApprovalStage approval;
    private SourcingStage sourcing;
    private OrderingStage ordering;
    private ReceivingStage receiving;
    private QualityStage quality;

    @Data
    @Builder
    public static class RequisitionStage {
        private String status;
        private LocalDateTime date;
        private String prNumber;
    }

    @Data
    @Builder
    public static class ApprovalStage {
        private String status;
        private String currentStep;
        private LocalDateTime lastActionDate;
    }

    @Data
    @Builder
    public static class SourcingStage {
        private String status; // e.g., "None", "In Progress", "Completed"
        private Integer rfqCount;
        private Integer quotationCount;
        private String comparisonStatus;
        private Integer selectedQuotationId; // من المقارنة المعتمدة - لإنشاء أمر الشراء
    }

    @Data
    @Builder
    public static class OrderingStage {
        private String status;
        private List<String> poNumbers;
        private List<Integer> poIds;
        private LocalDateTime lastPoDate;
    }

    @Data
    @Builder
    public static class ReceivingStage {
        private String status;
        private List<String> grnNumbers;
        private List<Integer> grnIds;
        private LocalDateTime lastGrnDate;
    }

    @Data
    @Builder
    public static class QualityStage {
        private String status;
        private String result; // Passed, Failed, Partial
        private LocalDateTime inspectionDate;
    }
}
