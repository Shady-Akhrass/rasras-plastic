package com.rasras.erp.procurement;

import com.rasras.erp.employee.Department;
import com.rasras.erp.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchaserequisitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRID")
    private Integer id;

    @Column(name = "PRNumber", nullable = false, length = 20)
    private String prNumber;

    @Column(name = "PRDate", nullable = false)
    @Builder.Default
    private LocalDateTime prDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RequestedByDeptID", nullable = false)
    private Department requestedByDept;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RequestedByUserID", nullable = false)
    private User requestedByUser;

    @Column(name = "RequiredDate")
    private LocalDate requiredDate;

    @Column(name = "Priority", length = 10)
    @Builder.Default
    private String priority = "Normal";

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft";

    @Column(name = "TotalEstimatedAmount", precision = 18, scale = 2)
    private BigDecimal totalEstimatedAmount;

    @Column(name = "Justification", length = 1000)
    private String justification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ApprovedByUserID")
    private User approvedBy;

    @Column(name = "ApprovedDate")
    private LocalDateTime approvedDate;

    @Column(name = "RejectionReason", length = 500)
    private String rejectionReason;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;

    @UpdateTimestamp
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @Column(name = "UpdatedBy")
    private Integer updatedBy;

    @OneToMany(mappedBy = "purchaseRequisition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseRequisitionItem> items;
}
