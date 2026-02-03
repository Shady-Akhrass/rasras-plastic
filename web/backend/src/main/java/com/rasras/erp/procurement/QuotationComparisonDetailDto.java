package com.rasras.erp.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationComparisonDetailDto {
    private Integer id;
    private Integer comparisonId;
    private Integer quotationId;
    private String quotationNumber; // UI helper
    private Integer supplierId;
    private String supplierNameAr; // UI helper
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String paymentTerms;
    private Integer deliveryDays;
    private Integer qualityRating;
    private Integer priceRating;
    private BigDecimal overallScore;
    private String comments;
    private BigDecimal deliveryCost;
    private String polymerGrade;

    public String getPolymerGrade() {
        return polymerGrade;
    }

    public void setPolymerGrade(String polymerGrade) {
        this.polymerGrade = polymerGrade;
    }
}
