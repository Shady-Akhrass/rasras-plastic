package com.rasras.erp.supplier.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierInvoiceItemDto {
    private Integer id;
    private Integer itemId;
    private String itemNameAr;
    private String description;
    private BigDecimal quantity;
    private Integer unitId;
    private String unitNameAr;
    private BigDecimal unitPrice;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
    private Integer grnItemId;
}
