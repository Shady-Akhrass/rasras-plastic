package com.rasras.erp.approval;

import com.rasras.erp.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "approvalrequests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RequestID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WorkflowID", nullable = false)
    private ApprovalWorkflow workflow;

    @Column(name = "DocumentType", nullable = false, length = 30)
    private String documentType;

    @Column(name = "DocumentID", nullable = false)
    private Integer documentId;

    @Column(name = "DocumentNumber", length = 30)
    private String documentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RequestedByUserID", nullable = false)
    private User requestedByUser;

    @CreationTimestamp
    @Column(name = "RequestedDate", updatable = false)
    private LocalDateTime requestedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CurrentStepID")
    private ApprovalWorkflowStep currentStep;

    @Column(name = "Status", length = 20)
    @Builder.Default
    private String status = "Pending";

    @Column(name = "TotalAmount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "Priority", length = 10)
    @Builder.Default
    private String priority = "Normal";

    @Column(name = "DueDate")
    private LocalDateTime dueDate;

    @Column(name = "Notes", length = 1000)
    private String notes;

    @Column(name = "CompletedDate")
    private LocalDateTime completedDate;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApprovalAction> actions = new java.util.ArrayList<>();
}
