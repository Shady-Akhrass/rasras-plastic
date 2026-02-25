package com.rasras.erp.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrderDto {
    private Integer id;
    private String deliveryOrderNumber;
    private LocalDate orderDate;
    private Integer issueNoteId;
    private String issueNoteNumber;
    private Integer customerId;
    private String customerNameAr;
    private String customerCode;
    private String deliveryAddress;
    private Integer zoneId;
    private String deliveryType;
    private Integer vehicleId;
    private Integer scheduleId;
    private List<Integer> selectedScheduleIds;
    private Integer contractorId;
    private String driverName;
    private String driverPhone;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private LocalDate actualDeliveryDate;
    private BigDecimal deliveryCost;
    private BigDecimal otherCosts;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private Boolean isCostOnCustomer;
    private String status;
    private String approvalStatus;
    private String receiverName;
    private String receiverPhone;
    private String receiverSignature;
    private String podAttachmentPath;
    private String notes;
    private String vehicleNo;
    private List<DeliveryOrderItemDto> items;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
}
