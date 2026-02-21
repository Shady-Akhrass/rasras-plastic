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
public class SalesOrderDto {
    private Integer id;
    private String soNumber;
    private LocalDate soDate;
    private Integer salesQuotationId;
    private String quotationNumber;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private Integer contactId;
    private Integer salesRepId;
    private String shippingAddress;
    private LocalDate expectedDeliveryDate;
    private String currency;
    private BigDecimal exchangeRate;
    private Integer priceListId;
    private String priceListName;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal deliveryCost;
    private BigDecimal otherCosts;
    private BigDecimal totalAmount;
    private String paymentTerms;
    private Integer paymentTermDays;
    private String status;
    private String approvalStatus;
    private String creditCheckStatus;
    private Integer creditCheckBy;
    private LocalDateTime creditCheckDate;
    private Integer approvedByUserId;
    private LocalDateTime approvedDate;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
    private List<SalesOrderItemDto> items;
}
