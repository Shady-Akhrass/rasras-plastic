package com.rasras.erp.inventory;

import com.rasras.erp.procurement.PurchaseOrder;
import com.rasras.erp.supplier.Supplier;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "goodsreceiptnotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoodsReceiptNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GRNID")
    private Integer id;

    @Column(name = "GRNNumber", length = 20, nullable = false)
    private String grnNumber;

    @Column(name = "GRNDate", nullable = false)
    @Builder.Default
    private LocalDateTime grnDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POID", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SupplierID", nullable = false)
    private Supplier supplier;

    @Column(name = "WarehouseID", nullable = false)
    private Integer warehouseId; // Simplified for now

    @Column(name = "DeliveryNoteNo", length = 50)
    private String deliveryNoteNo;

    @Column(name = "SupplierInvoiceNo", length = 50)
    private String supplierInvoiceNo;

    @Column(name = "ReceivedByUserID", nullable = false)
    private Integer receivedByUserId;

    @Column(name = "InspectedByUserID")
    private Integer inspectedByUserId;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "QualityStatus", length = 20)
    private String qualityStatus;

    @Column(name = "TotalReceivedQty", precision = 18, scale = 3)
    private BigDecimal totalReceivedQty;

    @Column(name = "TotalAcceptedQty", precision = 18, scale = 3)
    private BigDecimal totalAcceptedQty;

    @Column(name = "TotalRejectedQty", precision = 18, scale = 3)
    private BigDecimal totalRejectedQty;

    @Column(name = "ShippingCost", precision = 18, scale = 2)
    private BigDecimal shippingCost;

    @Column(name = "OtherCosts", precision = 18, scale = 2)
    private BigDecimal otherCosts;

    @Column(name = "TotalAmount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @Column(name = "UpdatedBy")
    private Integer updatedBy;

    @OneToMany(mappedBy = "grn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GRNItem> items;
}
