package com.rasras.erp.supplier;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierOutstandingDto {
    private Integer id;
    private String supplierCode;
    private String supplierNameAr;
    private BigDecimal creditLimit;
    private BigDecimal totalInvoiced;
    private BigDecimal totalPaid;
    private BigDecimal totalReturned;
    private BigDecimal currentBalance;
    private String currency;
    private String lastPaymentDate; // Placeholder for now
}
