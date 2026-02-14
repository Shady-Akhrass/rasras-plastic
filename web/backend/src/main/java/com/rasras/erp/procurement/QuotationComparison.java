package com.rasras.erp.procurement;

import com.rasras.erp.inventory.Item;
import com.rasras.erp.supplier.Supplier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quotationcomparisons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationComparison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ComparisonID")
    private Integer id;

    @Column(name = "ComparisonNumber", nullable = false, length = 20)
    private String comparisonNumber;

    @Column(name = "ComparisonDate", nullable = false)
    @Builder.Default
    private LocalDateTime comparisonDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRID")
    private PurchaseRequisition purchaseRequisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SelectedQuotationID")
    private SupplierQuotation selectedQuotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SelectedSupplierID")
    private Supplier selectedSupplier;

    @Column(name = "SelectionReason", length = 500)
    private String selectionReason;

    @Column(name = "Status", length = 30)
    @Builder.Default
    private String status = "Draft"; // Draft, Pending Finance, Pending Management, Approved, Rejected

    @Column(name = "ApprovalStatus", length = 20)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "FinanceReviewedBy")
    private Integer financeReviewedBy;

    @Column(name = "FinanceReviewedDate")
    private LocalDateTime financeReviewedDate;

    @Column(name = "ManagementApprovedBy")
    private Integer managementApprovedBy;

    @Column(name = "ManagementApprovedDate")
    private LocalDateTime managementApprovedDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    // ═══ Rejection Tracking Fields ═══
    @Column(name = "RejectionCount")
    @Builder.Default
    private Integer rejectionCount = 0;

    @Column(name = "LastRejectionDate")
    private LocalDateTime lastRejectionDate;

    @Column(name = "RejectionReason", length = 1000)
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;

    @OneToMany(mappedBy = "comparison", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuotationComparisonDetail> details;
}
