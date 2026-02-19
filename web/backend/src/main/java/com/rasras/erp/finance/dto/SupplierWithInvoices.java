package com.rasras.erp.finance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierWithInvoices {

    private Integer supplierId;
    private String nameAr;
    private String nameEn;
    private String code;
    private BigDecimal totalOutstanding;
    private List<InvoiceComparisonData> pendingInvoices;
}