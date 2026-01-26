package com.rasras.erp.sales;

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
public class SalesQuotationDto {
    private Integer id;
    private String quotationNumber;
    private LocalDateTime quotationDate;
    private LocalDate validUntilDate;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private Integer contactId;
    private Integer salesRepId;
    private String currency;
    private BigDecimal exchangeRate;
    private Integer priceListId;
    private String priceListName;
    private BigDecimal subTotal;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentTerms;
    private String deliveryTerms;
    private String status;
    private LocalDateTime sentDate;
    private LocalDateTime acceptedDate;
    private String rejectedReason;
    private String notes;
    private String termsAndConditions;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
    private List<SalesQuotationItemDto> items;
}
