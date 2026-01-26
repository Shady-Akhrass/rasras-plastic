package com.rasras.erp.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Integer> {
    Optional<ApprovalWorkflow> findByWorkflowCode(String workflowCode);

    List<ApprovalWorkflow> findByDocumentType(String documentType);
}
