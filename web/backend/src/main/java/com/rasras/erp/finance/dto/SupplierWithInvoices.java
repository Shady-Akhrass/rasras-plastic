package com.rasras.erp.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierWithInvoices {
    private Integer supplierId;
    private String nameAr;
    private String nameEn;
    private String code;
    private List<InvoiceComparisonData> pendingInvoices;
    private BigDecimal totalOutstanding;
}
