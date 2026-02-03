package com.rasras.erp.sales;

import com.rasras.erp.crm.Customer;
import com.rasras.erp.inventory.Warehouse;
import com.rasras.erp.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * إذن صرف من المخزن (Stock Issue Note)
 * يصدر من المخزن بناءً على أمر البيع SO
 */
@Entity
@Table(name = "stockissuenotes")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockIssueNote extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IssueNoteID")
    private Integer id;

    @Column(name = "IssueNoteNumber", nullable = false, length = 20, unique = true)
    private String issueNoteNumber;

    @Column(name = "IssueDate", nullable = false)
    @Builder.Default
    private LocalDateTime issueDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOID", nullable = false)
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WarehouseID", nullable = false)
    private Warehouse warehouse;

    @Column(name = "IssuedByUserID", nullable = false)
    private Integer issuedByUserId;

    @Column(name = "ReceivedByName", length = 100)
    private String receivedByName;

    @Column(name = "ReceivedByID", length = 50)
    private String receivedById;

    @Column(name = "ReceivedBySignature", length = 500)
    private String receivedBySignature;

    @Column(name = "VehicleNo", length = 20)
    private String vehicleNo;

    @Column(name = "DriverName", length = 100)
    private String driverName;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "DeliveryDate")
    private LocalDateTime deliveryDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "stockIssueNote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockIssueNoteItem> items;
}
