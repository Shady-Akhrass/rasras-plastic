package com.rasras.erp.approval;

import com.rasras.erp.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvalactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ActionID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RequestID", nullable = false)
    private ApprovalRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StepID", nullable = false)
    private ApprovalWorkflowStep step;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ActionByUserID", nullable = false)
    private User actionByUser;

    @CreationTimestamp
    @Column(name = "ActionDate", updatable = false)
    private LocalDateTime actionDate;

    @Column(name = "ActionType", nullable = false, length = 20)
    private String actionType; // Approved, Rejected, Clarify, Delegate

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DelegatedToUserID")
    private User delegatedToUser;

    @Column(name = "Comments", length = 1000)
    private String comments;

    @Column(name = "AttachmentPath", length = 500)
    private String attachmentPath;
}
