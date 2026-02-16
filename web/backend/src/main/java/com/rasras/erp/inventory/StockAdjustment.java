package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * جرد المخزون / تسوية المخزون
 * يستخدم لتسجيل نتائج الجرد الدوري أو المفاجئ
 */
@Entity
@Table(name = "stockadjustments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AdjustmentID")
    private Integer id;

    @Column(name = "AdjustmentNumber", nullable = false, length = 20, unique = true)
    private String adjustmentNumber;

    @Column(name = "AdjustmentDate", nullable = false)
    @Builder.Default
    private LocalDateTime adjustmentDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WarehouseID", nullable = false)
    private Warehouse warehouse;

    @Column(name = "AdjustmentType", nullable = false, length = 20)
    private String adjustmentType; // PERIODIC, SURPRISE, ADJUSTMENT

    @Column(name = "Reason", length = 500)
    private String reason;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Draft"; // Draft, Submitted, Approved, Posted

    @Column(name = "ApprovedByUserID")
    private Integer approvedByUserId;

    @Column(name = "ApprovedDate")
    private LocalDateTime approvedDate;

    @Column(name = "PostedDate")
    private LocalDateTime postedDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;

    @OneToMany(mappedBy = "adjustment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockAdjustmentItem> items;
}
