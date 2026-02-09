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
public class PurchaseOrderDto {
    private Integer id;
    private String poNumber;
    private LocalDateTime poDate;
    private Integer prId;
    private Integer quotationId;
    private Integer supplierId;
    private String supplierNameAr; // UI helper
    private LocalDate expectedDeliveryDate;
    private Integer deliveryDays;
    private String shippingMethod;
    private String shippingTerms;
    private String paymentTerms;
    private Integer paymentTermDays;
    private String currency;
    private BigDecimal exchangeRate;
    private BigDecimal subTotal;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private BigDecimal otherCosts;
    private BigDecimal totalAmount;
    private String status;
    private String approvalStatus;
    private String notes;
    private String termsAndConditions;
    private List<PurchaseOrderItemDto> items;
}
