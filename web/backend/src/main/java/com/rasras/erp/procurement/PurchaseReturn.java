package com.rasras.erp.procurement;

import com.rasras.erp.shared.audit.AuditableEntity;
import com.rasras.erp.supplier.Supplier;
import com.rasras.erp.inventory.Warehouse;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchasereturns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturn extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PurchaseReturnID")
    private Integer id;

    @Column(name = "ReturnNumber", nullable = false, length = 20)
    private String returnNumber;

    @Column(name = "ReturnDate", nullable = false)
    @Builder.Default
    private LocalDateTime returnDate = LocalDateTime.now();

    @Column(name = "GRNID")
    private Integer grnId;

    @Column(name = "SupplierInvoiceID")
    private Integer supplierInvoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WarehouseID", nullable = false)
    private Warehouse warehouse;

    @Column(name = "ReturnReason", length = 50)
    private String returnReason;

    @Column(name = "SubTotal", precision = 18, scale = 2, nullable = false)
    private BigDecimal subTotal;

    @Column(name = "TaxAmount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "TotalAmount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "DebitNoteID")
    private Integer debitNoteId;

    @Column(name = "ApprovedByUserID")
    private Integer approvedByUserId;

    @Column(name = "ApprovedDate")
    private LocalDateTime approvedDate;

    @Column(name = "PreparedByUserID", nullable = false)
    private Integer preparedByUserId;

    @Column(name = "SentToSupplierDate")
    private LocalDateTime sentToSupplierDate;

    @Column(name = "SupplierAcknowledgedDate")
    private LocalDateTime supplierAcknowledgedDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "purchaseReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseReturnItem> items;
}
