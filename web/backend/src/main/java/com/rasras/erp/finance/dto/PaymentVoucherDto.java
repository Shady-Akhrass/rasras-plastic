package com.rasras.erp.finance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVoucherDto {
    // Payment Voucher Data Transfer Object
    private Integer paymentVoucherId;

    private String voucherNumber;
    private LocalDate voucherDate;
    private Integer supplierId;
    private String payeeName;
    private String paymentMethod;
    private String bankName;
    private String accountNumber;
    private String checkNumber;
    private String currency;
    private BigDecimal exchangeRate;
    private BigDecimal amount;
    private BigDecimal cashAmount;
    private BigDecimal bankAmount;
    private BigDecimal chequeAmount;
    private BigDecimal bankTransferAmount;
    private Boolean isSplitPayment;
    private String description;

    private String notes;
    private String status;
    private String approvalStatus;
    private String supplierNameAr;
    private String supplierNameEn;
    private Integer preparedByUserId;
    private List<PaymentVoucherAllocationDto> allocations;
}
