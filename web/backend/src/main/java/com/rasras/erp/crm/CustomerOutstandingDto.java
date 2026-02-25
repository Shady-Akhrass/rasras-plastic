package com.rasras.erp.crm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOutstandingDto {
    private Integer id;
    private String customerCode;
    private String customerNameAr;
    private BigDecimal creditLimit;
    private BigDecimal totalInvoiced;
    private BigDecimal totalPaid;
    private BigDecimal totalReturned;
    private BigDecimal currentBalance;
    private String currency;
}
