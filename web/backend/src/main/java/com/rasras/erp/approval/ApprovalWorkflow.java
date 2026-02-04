package com.rasras.erp.approval;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvalworkflows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalWorkflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WorkflowID")
    private Integer workflowId;

    @Column(name = "WorkflowCode", nullable = false, unique = true, length = 50)
    private String workflowCode;

    @Column(name = "WorkflowName", nullable = false, length = 100)
    private String workflowName;

    @Column(name = "DocumentType", nullable = false, length = 30)
    private String documentType;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
}
