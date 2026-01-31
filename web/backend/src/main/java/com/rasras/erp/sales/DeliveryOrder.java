package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * أمر التوصيل (Delivery Order)
 * مرتبط بإذن الصرف ومتابعة اللوجستيات (السائق، المركبة، المنطقة)
 */
@Entity
@Table(name = "deliveryorders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrder extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DeliveryOrderID")
    private Integer id;

    @Column(name = "DeliveryOrderNumber", nullable = false, length = 20, unique = true)
    private String deliveryOrderNumber;

    @Column(name = "OrderDate", nullable = false)
    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IssueNoteID", nullable = false)
    private StockIssueNote stockIssueNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID", nullable = false)
    private Customer customer;

    @Column(name = "DeliveryAddress", length = 500)
    private String deliveryAddress;

    @Column(name = "ZoneID")
    private Integer zoneId;

    @Column(name = "DeliveryType", length = 20)
    private String deliveryType;

    @Column(name = "VehicleID")
    private Integer vehicleId;

    @Column(name = "ContractorID")
    private Integer contractorId;

    @Column(name = "DriverName", length = 100)
    private String driverName;

    @Column(name = "DriverPhone", length = 20)
    private String driverPhone;

    @Column(name = "ScheduledDate")
    private LocalDate scheduledDate;

    @Column(name = "ScheduledTime")
    private LocalTime scheduledTime;

    @Column(name = "ActualDeliveryDate")
    private LocalDateTime actualDeliveryDate;

    @Column(name = "DeliveryCost", precision = 18, scale = 2)
    private BigDecimal deliveryCost;

    @Column(name = "IsCostOnCustomer")
    @Builder.Default
    private Boolean isCostOnCustomer = false;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Pending";

    @Column(name = "ReceiverName", length = 100)
    private String receiverName;

    @Column(name = "ReceiverPhone", length = 20)
    private String receiverPhone;

    @Column(name = "ReceiverSignature", length = 500)
    private String receiverSignature;

    @Column(name = "PODAttachmentPath", length = 500)
    private String podAttachmentPath;

    @Column(name = "Notes", length = 1000)
    private String notes;
}
