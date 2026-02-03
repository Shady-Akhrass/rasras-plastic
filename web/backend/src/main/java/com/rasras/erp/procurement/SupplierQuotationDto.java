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
public class SupplierQuotationDto {
    private Integer id;
    private String quotationNumber;
    private Integer rfqId;
    private String rfqNumber; // UI helper
    private Integer supplierId;
    private String supplierNameAr; // UI helper
    private LocalDate quotationDate;
    private LocalDate validUntilDate;
    private String currency;
    private BigDecimal exchangeRate;
    private String paymentTerms;
    private String deliveryTerms;
    private Integer deliveryDays;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCost;
    private String status;
    private String attachmentPath;
    private String notes;
    private Integer receivedByUserId;
    private LocalDateTime receivedDate;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private List<SupplierQuotationItemDto> items;
}
