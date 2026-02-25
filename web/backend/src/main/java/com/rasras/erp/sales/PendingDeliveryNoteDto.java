package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingDeliveryNoteDto {
    private Integer issueNoteId;
    private String issueNoteNumber;
    private LocalDate issueDate;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private Integer salesOrderId;
    private String soNumber;
    private Integer scheduleId;
    private LocalDate deliveryDate;
    private Integer itemsCount;
    private String status;
    private String notes;
}
