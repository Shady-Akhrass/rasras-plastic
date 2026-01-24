package com.rasras.erp.procurement.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseReturnDto {
    private Integer id;
    private String returnNumber;
    private LocalDateTime returnDate;
    private Integer grnId;
    private String grnNumber;
    private Integer supplierInvoiceId;
    private String supplierInvoiceNo;
    private Integer supplierId;
    private String supplierNameAr;
    private Integer warehouseId;
    private String warehouseNameAr;
    private String returnReason;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String status;
<<<<<<< HEAD
    private Integer preparedByUserId;
=======
>>>>>>> c47efc5 (final)
    private List<PurchaseReturnItemDto> items;
}
