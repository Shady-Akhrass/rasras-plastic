package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrderDto {
    private Integer id;
    private String deliveryOrderNumber;
    private LocalDateTime orderDate;
    private Integer issueNoteId;
    private String issueNoteNumber;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private String deliveryAddress;
    private Integer zoneId;
    private String deliveryType;
    private Integer vehicleId;
    private Integer contractorId;
    private String driverName;
    private String driverPhone;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private LocalDateTime actualDeliveryDate;
    private BigDecimal deliveryCost;
    private Boolean isCostOnCustomer;
    private String status;
    private String receiverName;
    private String receiverPhone;
    private String receiverSignature;
    private String podAttachmentPath;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
}
