package com.rasras.erp.inventory;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class QualityInspectionRequestDto {
    private Integer inspectedByUserId;
    private String overallResult;
    private String notes;
    private List<ItemInspectionRequest> items;

    @Data
    public static class ItemInspectionRequest {
        private Integer itemId;
        private BigDecimal acceptedQty;
        private BigDecimal rejectedQty;
        private String overallResult;
        private String notes;
        private List<ParameterResultRequest> parameterResults;
    }

    @Data
    public static class ParameterResultRequest {
        private Integer parameterId;
        private String actualValue;
        private String result; // Passed, Failed
        private String comments;
    }
}
