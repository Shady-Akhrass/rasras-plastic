package com.rasras.erp.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Integer> {
    Optional<ApprovalWorkflow> findByWorkflowCode(String workflowCode);

    List<ApprovalWorkflow> findByDocumentType(String documentType);
}

@Repository
interface ApprovalWorkflowStepRepository extends JpaRepository<ApprovalWorkflowStep, Integer> {
    List<ApprovalWorkflowStep> findByWorkflowWorkflowIdOrderByStepNumberAsc(Integer workflowId);
}

@Repository
interface ApprovalLimitRepository extends JpaRepository<ApprovalLimit, Integer> {
    List<ApprovalLimit> findByActivityTypeAndIsActiveTrue(String activityType);
}

@Repository
interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Integer> {
    List<ApprovalRequest> findByDocumentTypeAndDocumentId(String documentType, Integer documentId);

    List<ApprovalRequest> findByStatus(String status);
}

@Repository
interface ApprovalActionRepository extends JpaRepository<ApprovalAction, Integer> {
    List<ApprovalAction> findByRequestIdOrderByActionDateDesc(Integer requestId);
}
