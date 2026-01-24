package com.rasras.erp.approval;

import com.rasras.erp.user.Role;
import com.rasras.erp.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "approvalworkflowsteps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalWorkflowStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "StepID")
    private Integer stepId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WorkflowID", nullable = false)
    private ApprovalWorkflow workflow;

    @Column(name = "StepNumber", nullable = false)
    private Integer stepNumber;

    @Column(name = "StepName", nullable = false, length = 100)
    private String stepName;

    @Column(name = "ApproverType", nullable = false, length = 20)
    private String approverType; // ROLE, USER

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ApproverRoleID")
    private Role approverRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ApproverUserID")
    private User approverUser;

    @Column(name = "MinAmount", precision = 18, scale = 2)
    private BigDecimal minAmount;

    @Column(name = "MaxAmount", precision = 18, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "IsRequired")
    @Builder.Default
    private Boolean isRequired = true;

    @Column(name = "CanSkip")
    @Builder.Default
    private Boolean canSkip = false;

    @Column(name = "EscalationDays")
    @Builder.Default
    private Integer escalationDays = 3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EscalateToStepID")
    private ApprovalWorkflowStep escalateToStep;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;
}
