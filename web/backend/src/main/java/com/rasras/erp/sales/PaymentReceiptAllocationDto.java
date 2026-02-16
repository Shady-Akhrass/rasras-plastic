package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptAllocationDto {
    private Integer id;
    private Integer receiptVoucherId;
    private Integer salesInvoiceId;
    private String invoiceNumber;
    private BigDecimal allocatedAmount;
    private LocalDate allocationDate;
    private String notes;
}
