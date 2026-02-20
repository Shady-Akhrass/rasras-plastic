package com.rasras.erp.supplier.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * بيانات المطابقة الثلاثية (PO + GRN + Invoice) لمراجعة المالية دون فتح قائمة GRN العامة.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceMatchDetailsDto {

    private Integer invoiceId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private BigDecimal invoiceTotal;

    private Integer poId;
    private String poNumber;
    private BigDecimal poTotal;

    private Integer grnId;
    private String grnNumber;
    private BigDecimal grnTotal;
    private String grnStatus;

    /** صالح للاعتماد (ربط PO + GRN مكتمل) */
    private Boolean validForApproval;
    private String message;

    private List<MatchDetailItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchDetailItemDto {
        private String itemName;
        private BigDecimal invoiceQuantity;
        private BigDecimal invoiceUnitPrice;
        private BigDecimal invoiceLineTotal;
        private BigDecimal poQuantity;
        private BigDecimal poUnitPrice;
        private BigDecimal poLineTotal;
        private BigDecimal grnQuantity;
        private BigDecimal grnUnitPrice;
        private BigDecimal grnLineTotal;
    }
}
