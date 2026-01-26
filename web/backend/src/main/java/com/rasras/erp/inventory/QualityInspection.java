package com.rasras.erp.inventory;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "qualityinspections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InspectionID")
    private Integer id;

    @Column(name = "InspectionNumber", length = 20, unique = true, nullable = false)
    private String inspectionNumber;

    @Column(name = "InspectionDate", nullable = false)
    @Builder.Default
    private LocalDateTime inspectionDate = LocalDateTime.now();

    @Column(name = "InspectionType", length = 20, nullable = false)
    private String inspectionType; // e.g., Incoming, InProcess

    @Column(name = "ReferenceType", length = 20)
    private String referenceType; // e.g., GRN, ProductionOrder

    @Column(name = "ReferenceID")
    private Integer referenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private Item item;

    @Column(name = "LotNumber", length = 50)
    private String lotNumber;

    @Column(name = "SampleSize", precision = 18, scale = 3)
    private java.math.BigDecimal sampleSize;

    @Column(name = "InspectedByUserID", nullable = false)
    private Integer inspectedByUserId;

    @Column(name = "OverallResult", length = 20)
    private String overallResult; // Passed, Failed

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "InProgress";

    @Column(name = "COAAttachmentPath", length = 500)
    private String coaAttachmentPath;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @Column(name = "CompletedDate")
    private LocalDateTime completedDate;

    @Column(name = "ApprovedByUserID")
    private Integer approvedByUserId;

    @Column(name = "ApprovedDate")
    private LocalDateTime approvedDate;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;

    @OneToMany(mappedBy = "inspection", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QualityInspectionResult> results;
}
