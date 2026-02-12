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
    private String description;
    private String notes;
    private String status;
    private String approvalStatus;
    private String supplierNameAr;
    private String supplierNameEn;
    private Integer preparedByUserId;
    private List<PaymentVoucherAllocationDto> allocations;
}
