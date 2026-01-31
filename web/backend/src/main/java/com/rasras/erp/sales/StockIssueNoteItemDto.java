package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockIssueNoteItemDto {
    private Integer id;
    private Integer stockIssueNoteId;
    private Integer soItemId;
    private Integer itemId;
    private String itemCode;
    private String itemNameAr;
    private String itemNameEn;
    private BigDecimal requestedQty;
    private BigDecimal issuedQty;
    private Integer unitId;
    private String unitNameAr;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String lotNumber;
    private Integer batchId;
    private Integer locationId;
    private String notes;
}
