package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptDto {
    private Integer id;
    private String voucherNumber;
    private LocalDateTime voucherDate;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private String payerName;
    private String paymentMethod;
    private Integer cashRegisterId;
    private Integer bankAccountId;
    private Integer chequeId;
    private String currency;
    private BigDecimal exchangeRate;
    private BigDecimal amount;
    private String amountInWords;
    private String referenceType;
    private Integer referenceId;
    private String description;
    private String status;
    private Integer journalEntryId;
    private Integer receivedByUserId;
    private String receivedByUserName;
    private Integer postedByUserId;
    private String postedByUserName;
    private LocalDateTime postedDate;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
    private List<PaymentReceiptAllocationDto> allocations;
}
